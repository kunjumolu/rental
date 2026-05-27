const express = require('express');
const {
  getRentals,
  getRentalStats,
  getRentalById,
  createRental,
  updateRental,
  updateRentalStatus,
  deleteRental
} = require('../controllers/rentalController');
const { protect,requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getRentalStats);
router.get('/', protect, getRentals);
router.post('/', protect, requireRole('admin', 'manager', 'staff'), createRental);
router.get('/:id', protect, getRentalById);
router.put('/:id', protect, requireRole('admin', 'manager'), updateRental);
router.patch('/:id', protect, requireRole('admin', 'manager'), updateRentalStatus);
router.delete('/:id', protect, requireRole('admin'), deleteRental);

module.exports = router;