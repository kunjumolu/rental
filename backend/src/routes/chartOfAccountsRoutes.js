const express = require('express');
const { getChartOfAccounts } = require('../controllers/chartOfAccountsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getChartOfAccounts);

module.exports = router;