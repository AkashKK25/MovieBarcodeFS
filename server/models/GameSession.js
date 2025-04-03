// server/models/GameSession.js
const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mode: {
    type: String,
    enum: ['standard', 'timeAttack', 'endless'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'hard'],
    required: true
  },
  category: {
    type: String,
    default: 'all'
  },
  score: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  movies: [{
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    correct: {
      type: Boolean
    },
    timeToAnswer: {
      type: Number // in seconds
    }
  }]
}, {
  timestamps: true
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);
module.exports = GameSession;