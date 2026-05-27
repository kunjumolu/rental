const express = require('express');
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');
const { protect,requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getVendors);
router.get('/:id', protect, getVendorById);
router.post('/', protect, requireRole('admin', 'manager'), createVendor);
router.put('/:id', protect, requireRole('admin', 'manager'), updateVendor);
router.delete('/:id', protect, requireRole('admin'), deleteVendor);

module.exports = router;