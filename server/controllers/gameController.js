// server/controllers/gameController.js
const GameSession = require('../models/GameSession');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const asyncHandler = require('express-async-handler');

// @desc    Start a new game session
// @route   POST /api/games
// @access  Private
const startGameSession = asyncHandler(async (req, res) => {
  const { mode, difficulty, category } = req.body;
  
  const gameSession = await GameSession.create({
    user: req.user._id,
    mode,
    difficulty,
    category: category || 'all',
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    duration: 0,
    completed: false,
    movies: []
  });
  
  res.status(201).json(gameSession);
});

// @desc    Update game session with a movie result
// @route   PUT /api/games/:id/movie
// @access  Private
const addMovieToGameSession = asyncHandler(async (req, res) => {
  const { movieId, correct, timeToAnswer } = req.body;
  
  const gameSession = await GameSession.findById(req.params.id);
  
  if (!gameSession) {
    res.status(404);
    throw new Error('Game session not found');
  }
  
  // Verify ownership
  if (gameSession.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  // Add the movie result
  gameSession.movies.push({
    movie: movieId,
    correct,
    timeToAnswer
  });
  
  // Update stats
  if (correct) {
    gameSession.correctAnswers += 1;
    gameSession.score += calculateScore(gameSession.mode, timeToAnswer);
  } else {
    gameSession.wrongAnswers += 1;
  }
  
  await gameSession.save();
  res.json(gameSession);
});

// @desc    Complete a game session
// @route   PUT /api/games/:id/complete
// @access  Private
const completeGameSession = asyncHandler(async (req, res) => {
  const { duration } = req.body;
  
  const gameSession = await GameSession.findById(req.params.id);
  
  if (!gameSession) {
    res.status(404);
    throw new Error('Game session not found');
  }
  
  // Verify ownership
  if (gameSession.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  gameSession.completed = true;
  gameSession.duration = duration;
  
  await gameSession.save();
  
  // Update user stats
  const user = await User.findById(req.user._id);
  user.stats.gamesPlayed += 1;
  user.stats.totalScore += gameSession.score;
  user.stats.correctAnswers += gameSession.correctAnswers;
  user.stats.wrongAnswers += gameSession.wrongAnswers;
  
  if (gameSession.score > user.stats.highScore) {
    user.stats.highScore = gameSession.score;
  }
  
  await user.save();
  
  // Update leaderboard
  await updateLeaderboard(
    gameSession.mode,
    gameSession.difficulty,
    gameSession.category,
    gameSession.user,
    gameSession.score
  );
  
  res.json(gameSession);
});

// Helper function to calculate score based on game mode and time
const calculateScore = (mode, timeToAnswer) => {
  switch (mode) {
    case 'timeAttack':
      // Faster answers get more points
      return Math.round(1000 * (1 / (timeToAnswer || 1)));
    case 'endless':
      return 100;
    default: // standard
      return 100;
  }
};

// Helper function to update leaderboard
const updateLeaderboard = async (mode, difficulty, category, userId, score) => {
  // Find or create leaderboard
  let leaderboard = await Leaderboard.findOne({
    mode,
    difficulty,
    category
  });
  
  if (!leaderboard) {
    leaderboard = await Leaderboard.create({
      mode,
      difficulty,
      category,
      entries: []
    });
  }
  
  // Add entry to leaderboard
  leaderboard.entries.push({
    user: userId,
    score,
    date: new Date()
  });
  
  // Sort entries and keep only top 100
  leaderboard.entries.sort((a, b) => b.score - a.score);
  
  if (leaderboard.entries.length > 100) {
    leaderboard.entries = leaderboard.entries.slice(0, 100);
  }
  
  await leaderboard.save();
};

// @desc    Get leaderboard
// @route   GET /api/games/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
  const { mode, difficulty, category } = req.query;
  
  const leaderboard = await Leaderboard.findOne({
    mode: mode || 'standard',
    difficulty: difficulty || 'easy',
    category: category || 'all'
  }).populate('entries.user', 'username avatar');
  
  if (!leaderboard) {
    return res.json({ entries: [] });
  }
  
  res.json(leaderboard);
});

module.exports = {
  startGameSession,
  addMovieToGameSession,
  completeGameSession,
  getLeaderboard
};