// server/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const { 
  startGameSession, 
  addMovieToGameSession, 
  completeGameSession,
  getLeaderboard 
} = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.post('/', protect, startGameSession);
router.put('/:id/movie', protect, addMovieToGameSession);
router.put('/:id/complete', protect, completeGameSession);

module.exports = router;