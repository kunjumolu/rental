const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../../config/db');
const { sendPasswordResetEmail } = require('../utils/emailService');

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

    // 🔒 Support BOTH bcrypt-hashed AND plain-text passwords (for backward compat)
    // bcrypt hashes always start with "$2a$", "$2b$", or "$2y$"
    let isMatch = false;
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      // Properly hashed — use bcrypt compare
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy plain-text password (your existing data)
      isMatch = user.password_hash === password;

      // 🔄 Auto-upgrade: hash it for next time so old users get secure storage
      if (isMatch) {
        const newHash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
          newHash,
          user.id,
        ]);
        console.log(`🔐 Auto-upgraded plain-text password to bcrypt for user ${user.email}`);
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
      {
        id: user.id,
        email: user.email,
        role: user.role_name,
      },
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
    res.status(500).json({
      success: false,
      message: 'Server Error during login',
    });
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
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// ============================================================
// @desc    Logout user
// @route   POST /api/auth/logout
// ============================================================
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// ============================================================
// @desc    Forgot password — send reset link to email
// @route   POST /api/auth/forgot-password
// ============================================================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  try {
    // 1. Find user by email
    const userResult = await db.query(
      'SELECT id, email, full_name, is_active FROM users WHERE email = $1',
      [email]
    );

    // 🔒 SECURITY: ALWAYS respond with success, whether email exists or not.
    //    Otherwise attackers can "discover" which emails are registered.
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    if (userResult.rows.length === 0) {
      return res.status(200).json(successResponse);
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      // Don't tell the attacker the account is deactivated
      return res.status(200).json(successResponse);
    }

    // 2. Generate a cryptographically-secure random token (64 hex chars)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing — so even DB leak doesn't expose usable tokens
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // 3. Invalidate any previous unused tokens for this user
    await db.query(
      `UPDATE password_reset_tokens
          SET used = true
        WHERE user_id = $1 AND used = false`,
      [user.id]
    );

    // 4. Insert new token
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // 5. Build reset URL (send the RAW token in the URL, not the hash)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    // 6. Send email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.full_name,
        resetUrl,
      });
      console.log(`📧 Password reset email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr.message);
      // For DEV: also log the link so you can test without working email
      console.log(`🔗 DEV reset link (email failed): ${resetUrl}`);
    }

    return res.status(200).json(successResponse);
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// ============================================================
// @desc    Verify a reset token (so frontend can show form or "invalid" UI)
// @route   GET /api/auth/verify-reset-token/:token
// ============================================================
exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await db.query(
      `SELECT prt.id, prt.expires_at, prt.used, u.email
         FROM password_reset_tokens prt
         JOIN users u ON u.id = prt.user_id
        WHERE prt.token = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link',
      });
    }

    const row = result.rows[0];

    if (row.used) {
      return res.status(400).json({
        success: false,
        message: 'This reset link has already been used',
      });
    }

    if (new Date(row.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This reset link has expired. Please request a new one.',
      });
    }

    res.status(200).json({
      success: true,
      data: { email: row.email },
    });
  } catch (error) {
    console.error('Verify Reset Token Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ============================================================
// @desc    Reset password using a valid token
// @route   POST /api/auth/reset-password
// ============================================================
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 1. Find the token row
    const tokRes = await client.query(
      `SELECT id, user_id, expires_at, used
         FROM password_reset_tokens
        WHERE token = $1
        FOR UPDATE`,
      [tokenHash]
    );

    if (tokRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid reset link',
      });
    }

    const row = tokRes.rows[0];

    if (row.used) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'This reset link has already been used',
      });
    }

    if (new Date(row.expires_at) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'This reset link has expired',
      });
    }

    // 2. Hash the new password with bcrypt
    const newHash = await bcrypt.hash(newPassword, 10);

    // 3. Update the user's password
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, row.user_id]
    );

    // 4. Mark token as used (single-use)
    await client.query(
      'UPDATE password_reset_tokens SET used = true WHERE id = $1',
      [row.id]
    );

    // 5. (Bonus) Invalidate ALL other unused reset tokens for this user
    await client.query(
      `UPDATE password_reset_tokens
          SET used = true
        WHERE user_id = $1 AND used = false`,
      [row.user_id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};
