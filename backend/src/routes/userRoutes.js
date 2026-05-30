const express = require('express');
const {
  // Admin-only
  getAllUsers,
  getRoles,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  // Self-service
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// ----- Self-service (any authenticated user) -----
router.get('/me/profile',          protect, getMyProfile);
router.put('/me/profile',          protect, updateMyProfile);
router.post('/me/change-password', protect, changeMyPassword);

// ----- Admin only -----
router.get('/roles',                  protect, requireRole('admin'), getRoles);
router.get('/',                       protect, requireRole('admin'), getAllUsers);
router.get('/:id',                    protect, requireRole('admin'), getUserById);
router.post('/',                      protect, requireRole('admin'), createUser);
router.put('/:id',                    protect, requireRole('admin'), updateUser);
router.patch('/:id/status',           protect, requireRole('admin'), toggleUserStatus);
router.post('/:id/reset-password',    protect, requireRole('admin'), resetUserPassword);

module.exports = router;
