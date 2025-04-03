// server/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getMoviesForGame, 
  getMovieCategories, 
  getMovieById,
  updateMovieStats 
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/categories', getMovieCategories);

// Protected routes
router.get('/game', protect, getMoviesForGame);
router.get('/:id', protect, getMovieById);
router.put('/:id/stats', protect, updateMovieStats);

module.exports = router;