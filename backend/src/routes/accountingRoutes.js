const express = require('express');
const { getFinancialSummary } = require('../controllers/accountingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, getFinancialSummary);

module.exports = router;