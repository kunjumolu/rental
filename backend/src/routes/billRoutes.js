const express = require('express');
const {
  getBills,
  getBillStats,
  getBillById,
  createBill,
  updateBill,
  markBillPaid,
  deleteBill
} = require('../controllers/billController');
const { protect ,requireRole} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getBillStats);
router.get('/', protect, getBills);
router.get('/:id', protect, getBillById);
router.post('/', protect, requireRole('admin', 'manager'), createBill);
router.put('/:id', protect, requireRole('admin', 'manager'), updateBill);
router.patch('/:id/pay', protect, requireRole('admin', 'manager'), markBillPaid);
router.delete('/:id', protect, requireRole('admin'), deleteBill);

module.exports = router;