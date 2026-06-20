const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: [{ type: String, required: true }],
  language: { type: String, required: true },
  duration: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  cast: [{ type: String }],
  trailer: { type: String },
  poster: { type: String },
  rating: { type: Number, default: 0 },
  reviews: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number, comment: String, date: { type: Date, default: Date.now } }],
  isTrending: { type: Boolean, default: false },
  isUpcoming: { type: Boolean, default: false },
  isComingSoon: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  comingSoonDate: { type: Date },
  similarMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
