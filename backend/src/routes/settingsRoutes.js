const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect ,requireRole} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:group', protect, getSettings);
router.put('/:group', protect, requireRole('admin'), updateSettings);

module.exports = router;