const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  screenNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  availableSeats: [[{ type: Boolean, default: true }]],
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);
