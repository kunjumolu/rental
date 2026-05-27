const express = require('express');
const {
  getInvoices,
  getInvoiceStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  deleteInvoice,
  generateInvoiceFromRental
} = require('../controllers/invoiceController');
const { protect,requireRole} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getInvoiceStats);
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);
router.post('/', protect, requireRole('admin', 'manager'), createInvoice);
router.post('/generate-from-rental/:rentalId', protect, generateInvoiceFromRental);

router.put('/:id', protect, requireRole('admin', 'manager'), updateInvoice);
router.patch('/:id/pay', protect, requireRole('admin', 'manager'), markInvoicePaid);
router.delete('/:id', protect, requireRole('admin'), deleteInvoice);

module.exports = router;