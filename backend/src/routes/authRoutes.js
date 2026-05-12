const express = require('express');
const { login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route (No middleware)
router.post('/login', login);

// Protected routes (Requires valid JWT)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;