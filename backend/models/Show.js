const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  screenNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  availableSeats: [[{ type: Boolean, default: true }]],
  price: { type: Number, required: true }, // Keeping for backward compatibility
  priceSilver: { type: Number, required: true },
  priceGold: { type: Number, required: true },
  pricePlatinum: { type: Number, required: true },
  seatTiers: [{ type: String, default: 'Silver' }] // e.g., ['Silver', 'Silver', 'Gold', 'Platinum']
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);
