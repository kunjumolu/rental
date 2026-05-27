const express = require('express');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect,requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomerById);
router.post('/', protect, requireRole('admin', 'manager'), createCustomer);
router.put('/:id', protect, requireRole('admin', 'manager'), updateCustomer);
router.delete('/:id', protect, requireRole('admin'), deleteCustomer);

module.exports = router;