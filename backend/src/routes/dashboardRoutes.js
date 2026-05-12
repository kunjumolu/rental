const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All dashboard routes are protected
router.use(protect);

// @route   GET /api/dashboard/stats
router.get('/stats', getStats);

module.exports = router;