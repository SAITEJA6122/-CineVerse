const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  screens: [{
    screenNumber: { type: Number, required: true },
    seatLayout: {
      rows: { type: Number, required: true },
      seatsPerRow: { type: Number, required: true },
      seatTypes: [{ type: String, price: Number }]
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);
