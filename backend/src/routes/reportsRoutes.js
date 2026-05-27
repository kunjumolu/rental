const express = require('express');
const {
  getBusinessOverview,
  getSalesReport,
  getReceivablesReport,
  getPaymentsReport,
  getPayablesReport,
  getExpensesReport,
  getInventoryReport,
  getCustomersReport,
  getRentalsReport
} = require('../controllers/reportsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/business-overview', protect, getBusinessOverview);
router.get('/sales', protect, getSalesReport);
router.get('/receivables', protect, getReceivablesReport);
router.get('/payments', protect, getPaymentsReport);
router.get('/payables', protect, getPayablesReport);
router.get('/expenses', protect, getExpensesReport);
router.get('/inventory', protect, getInventoryReport);
router.get('/customers', protect, getCustomersReport);
router.get('/rentals', protect, getRentalsReport);

module.exports = router;