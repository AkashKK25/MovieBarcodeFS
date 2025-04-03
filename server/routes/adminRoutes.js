// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Movie = require('../models/Movie');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Set up multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// @desc    Add a new movie
// @route   POST /api/admin/movies
// @access  Admin
router.post('/movies', protect, admin, upload.fields([
  { name: 'easyBarcode', maxCount: 1 },
  { name: 'hardBarcode', maxCount: 1 },
  { name: 'poster', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, year, director, genres, difficulty, categories } = req.body;
    
    const movie = await Movie.create({
      title,
      year: parseInt(year),
      director,
      genres: JSON.parse(genres),
      barcodeImage: {
        easy: req.files.easyBarcode ? `/uploads/${req.files.easyBarcode[0].filename}` : '',
        hard: req.files.hardBarcode ? `/uploads/${req.files.hardBarcode[0].filename}` : ''
      },
      posterImage: req.files.poster ? `/uploads/${req.files.poster[0].filename}` : '',
      difficulty: parseInt(difficulty) || 5,
      categories: JSON.parse(categories)
    });
    
    res.status(201).json(movie);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a movie
// @route   DELETE /api/admin/movies/:id
// @access  Admin
router.delete('/movies/:id', protect, admin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (movie) {
      await movie.remove();
      res.json({ message: 'Movie removed' });
    } else {
      res.status(404);
      throw new Error('Movie not found');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error('Cannot delete admin user');
      }
      
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get database stats
// @route   GET /api/admin/stats
// @access  Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const movieCount = await Movie.countDocuments();
    
    // Most popular movie
    const popularMovie = await Movie.findOne().sort({ timesCorrect: -1 });
    
    // Most difficult movie (lowest correct percentage)
    const difficultMovie = await Movie.find({ timesShown: { $gt: 10 } })
      .sort({ $expr: { $divide: ['$timesCorrect', '$timesShown'] } });
    
    res.json({
      userCount,
      movieCount,
      popularMovie: popularMovie ? {
        title: popularMovie.title,
        timesShown: popularMovie.timesShown,
        timesCorrect: popularMovie.timesCorrect
      } : null,
      difficultMovie: difficultMovie.length ? {
        title: difficultMovie[0].title,
        timesShown: difficultMovie[0].timesShown,
        timesCorrect: difficultMovie[0].timesCorrect,
        correctPercentage: (difficultMovie[0].timesCorrect / difficultMovie[0].timesShown) * 100
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;