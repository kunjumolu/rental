const express = require('express');
const {
  getInventoryItems,
  getInventoryStats,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryStatus,
  deleteInventoryItem
} = require('../controllers/inventoryController');
const { protect ,requireRole} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getInventoryStats);
router.get('/', protect, getInventoryItems);
router.get('/:id', protect, getInventoryItemById);
router.post('/', protect, requireRole('admin', 'manager'), createInventoryItem);
router.put('/:id', protect, requireRole('admin', 'manager'), updateInventoryItem);
router.patch('/:id/status', protect, requireRole('admin', 'manager'), updateInventoryStatus);
router.delete('/:id', protect, requireRole('admin'), deleteInventoryItem);
module.exports = router;