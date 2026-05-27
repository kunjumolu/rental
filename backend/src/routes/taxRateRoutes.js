const express = require('express');
const {
  getTaxRates,
  getTaxRateById,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate
} = require('../controllers/taxRateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTaxRates);
router.get('/:id', protect, getTaxRateById);
router.post('/', protect, createTaxRate);
router.put('/:id', protect, updateTaxRate);
router.delete('/:id', protect, deleteTaxRate);

module.exports = router;