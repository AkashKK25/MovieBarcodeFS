// server/models/Leaderboard.js
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
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
  entries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient leaderboard queries
leaderboardSchema.index({ mode: 1, difficulty: 1, category: 1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
module.exports = Leaderboard;
