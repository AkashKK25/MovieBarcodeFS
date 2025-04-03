// server/models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number
  },
  director: {
    type: String,
    trim: true
  },
  genres: [{
    type: String,
    trim: true
  }],
  barcodeImage: {
    easy: { type: String, required: true },
    hard: { type: String, required: true }
  },
  posterImage: {
    type: String
  },
  difficulty: {
    type: Number, // 1-10 scale for dynamic difficulty
    default: 5
  },
  categories: [{
    type: String, 
    enum: ['action', 'comedy', 'drama', 'sci-fi', 'horror', 'animated', 'classic', 'blockbuster']
  }],
  timesShown: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;