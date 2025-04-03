// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getUserStats,
  updateUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/stats', protect, getUserStats);

module.exports = router;