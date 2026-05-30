const express = require('express');
const {
  login,
  getMe,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', login);

// Password reset flow (OTP-based, all public)
router.post('/forgot-password', forgotPassword);  // Step 1: send OTP to email
router.post('/verify-otp',      verifyOtp);       // Step 2: verify OTP
router.post('/reset-password',  resetPassword);   // Step 3: set new password

// Protected routes
router.get('/me',      protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;