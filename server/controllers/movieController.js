// server/controllers/movieController.js
const Movie = require('../models/Movie');
const asyncHandler = require('express-async-handler');

// @desc    Get movies for game (with filtering)
// @route   GET /api/movies/game
// @access  Private
const getMoviesForGame = asyncHandler(async (req, res) => {
  const { difficulty, category, count = 10 } = req.query;
  
  // Build filter
  const filter = {};
  
  if (category && category !== 'all') {
    filter.categories = category;
  }

  // Get random selection of movies
  const movies = await Movie.aggregate([
    { $match: filter },
    { $sample: { size: parseInt(count) } },
    { $project: {
        title: 1,
        year: 1,
        director: 1,
        genres: 1,
        barcodeImage: 1,
        posterImage: 1,
        difficulty: 1,
        categories: 1
      }
    }
  ]);
  
  // For each movie, get 3 random incorrect options
  const moviesWithOptions = await Promise.all(
    movies.map(async (movie) => {
      const incorrectOptions = await Movie.aggregate([
        { $match: { _id: { $ne: movie._id } } },
        { $sample: { size: 3 } },
        { $project: { title: 1, year: 1 } }
      ]);
      
      return {
        ...movie,
        incorrectOptions: incorrectOptions.map(m => ({
          title: m.title,
          year: m.year
        }))
      };
    })
  );
  
  res.json(moviesWithOptions);
});

// @desc    Get movie categories
// @route   GET /api/movies/categories
// @access  Public
const getMovieCategories = asyncHandler(async (req, res) => {
  const categories = await Movie.distinct('categories');
  res.json(categories);
});

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Private
const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  
  if (movie) {
    res.json(movie);
  } else {
    res.status(404);
    throw new Error('Movie not found');
  }
});

// @desc    Update movie stats after guessing
// @route   PUT /api/movies/:id/stats
// @access  Private
const updateMovieStats = asyncHandler(async (req, res) => {
  const { correct } = req.body;
  
  const movie = await Movie.findById(req.params.id);
  
  if (movie) {
    movie.timesShown += 1;
    if (correct) {
      movie.timesCorrect += 1;
    }
    
    await movie.save();
    res.status(200).json({ success: true });
  } else {
    res.status(404);
    throw new Error('Movie not found');
  }
});

module.exports = {
  getMoviesForGame,
  getMovieCategories,
  getMovieById,
  updateMovieStats
};