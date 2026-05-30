const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../../config/db');

// ============================================================
// Email Transporter (Gmail)
// Set EMAIL_USER and EMAIL_PASS in your .env file
// Use Gmail App Password (not your Gmail login password)
// ============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================
// @desc    Login user / Get token
// @route   POST /api/auth/login
// ============================================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.password_hash, u.is_active, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Support BOTH bcrypt-hashed AND plain-text passwords (for backward compat)
    let isMatch = false;
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      isMatch = user.password_hash === password;

      // Auto-upgrade plain-text passwords to bcrypt
      if (isMatch) {
        const newHash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
          newHash,
          user.id,
        ]);
        console.log(`Auto-upgraded plain-text password to bcrypt for ${user.email}`);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role_name,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};

// ============================================================
// @desc    Get current user
// @route   GET /api/auth/me
// ============================================================
exports.getMe = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at, r.name as role
       FROM users u JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ============================================================
// @desc    Logout user
// @route   POST /api/auth/logout
// ============================================================
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'User logged out successfully' });
};

// ============================================================
// OTP-BASED FORGOT PASSWORD (via Email)
//
// Flow:
//   1. POST /forgot-password  { email }
//      → Generates 6-digit OTP, stores hash in DB, sends OTP to email
//
//   2. POST /verify-otp       { email, otp }
//      → Verifies OTP, returns a short-lived reset token
//
//   3. POST /reset-password   { resetToken, newPassword }
//      → Resets password using the token from step 2
// ============================================================

// In-memory store for active reset tokens (short-lived, 10 min)
// In production, use Redis.
const resetTokenStore = new Map();

// Helper: generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ============================================================
// @desc    Step 1: Request OTP — sends OTP to user's email
// @route   POST /api/auth/forgot-password
// ============================================================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Find user
    const userResult = await db.query(
      'SELECT id, email, full_name, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.',
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous unused tokens
    await db.query(
      `UPDATE password_reset_tokens SET used = true
        WHERE user_id = $1 AND used = false`,
      [user.id]
    );

    // Store hashed OTP in DB
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, otpHash, expiresAt]
    );

    // Send OTP via Email
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #6B21A8; margin-bottom: 8px;">Password Reset OTP</h2>
          <p style="color: #374151;">Hi <strong>${user.full_name}</strong>,</p>
          <p style="color: #374151;">We received a request to reset your password. Use the OTP below to proceed:</p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #6B21A8;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #6b7280; font-size: 14px;">If you did not request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    });

    console.log(`Password reset OTP sent to ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
      data: {
        email: user.email,
        expiresInMinutes: 10,
      },
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ============================================================
// @desc    Step 2: Verify OTP and get reset token
// @route   POST /api/auth/verify-otp
// ============================================================
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required',
    });
  }

  try {
    // Find user
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    // Hash the OTP for comparison
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Find matching active token
    const tokRes = await db.query(
      `SELECT id, expires_at, used FROM password_reset_tokens
        WHERE user_id = $1 AND token = $2`,
      [userId, otpHash]
    );

    if (tokRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.',
      });
    }

    const row = tokRes.rows[0];

    if (row.used) {
      return res.status(400).json({
        success: false,
        message: 'This OTP has already been used. Request a new one.',
      });
    }

    if (new Date(row.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    // OTP valid — generate a short-lived reset token (10 min)
    const resetToken = crypto.randomBytes(32).toString('hex');
    resetTokenStore.set(resetToken, {
      userId,
      tokenRowId: row.id,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Clean up expired tokens from memory
    for (const [k, v] of resetTokenStore) {
      if (v.expiresAt < Date.now()) resetTokenStore.delete(k);
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified. You can now reset your password.',
      data: { resetToken },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ============================================================
// @desc    Step 3: Reset password using reset token
// @route   POST /api/auth/reset-password
// ============================================================
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Reset token and new password are required',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const tokenData = resetTokenStore.get(resetToken);

  if (!tokenData) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset session. Please start over.',
    });
  }

  if (tokenData.expiresAt < Date.now()) {
    resetTokenStore.delete(resetToken);
    return res.status(400).json({
      success: false,
      message: 'Reset session expired. Please start over.',
    });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await client.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newHash, tokenData.userId]
    );

    // Mark OTP as used
    await client.query(
      `UPDATE password_reset_tokens SET used = true WHERE id = $1`,
      [tokenData.tokenRowId]
    );

    // Invalidate all other unused tokens for this user
    await client.query(
      `UPDATE password_reset_tokens SET used = true
        WHERE user_id = $1 AND used = false`,
      [tokenData.userId]
    );

    await client.query('COMMIT');

    // Remove from in-memory store
    resetTokenStore.delete(resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};