// Gmail SMTP via Nodemailer
// .env-il EMAIL_USER and EMAIL_APP_PASSWORD set cheyyanam
// Gmail App Password create cheyyanam: https://myaccount.google.com/apppasswords
// (2-Step Verification ON aakkanam adyam)

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,           // your-email@gmail.com
    pass: process.env.EMAIL_APP_PASSWORD,   // 16-char app password (NOT regular password!)
  },
});

// Verify connection on startup (optional - just logs)
transporter.verify((err) => {
  if (err) {
    console.warn('⚠️  Email service not configured properly:', err.message);
    console.warn('   Set EMAIL_USER and EMAIL_APP_PASSWORD in .env');
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Send a password reset email with a clickable link.
 */
exports.sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  const mailOptions = {
    from: `"White Legacy" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your White Legacy password',
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">

          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 800;">White Legacy</h1>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">MINIMAL · MAJESTIC · MEMORABLE</p>
          </div>

          <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">Reset your password</h2>

          <p style="color: #374151; font-size: 15px; line-height: 24px; margin: 0 0 16px;">
            Hi ${fullName || 'there'},
          </p>

          <p style="color: #374151; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
            We received a request to reset your password. Click the button below to set a new one.
            This link will expire in <strong>1 hour</strong>.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #6B21A8; color: white; padding: 14px 32px;
                      border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Reset Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 20px; margin: 24px 0 0;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${resetUrl}" style="color: #6B21A8; word-break: break-all;">${resetUrl}</a>
          </p>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

          <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not be changed.
          </p>
        </div>

        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
          © ${new Date().getFullYear()} White Legacy · All rights reserved
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
