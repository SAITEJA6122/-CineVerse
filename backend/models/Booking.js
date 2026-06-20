const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  selectedSeats: [{ row: Number, seat: Number }],
  bookingDate: { type: Date, default: Date.now },
  ticketPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
