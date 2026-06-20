const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const useMockData = process.env.USE_MOCK_DATA !== 'false';

if (!useMockData) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
} else {
  console.log('Using mock data - skipping MongoDB connection');
}

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/theaters', require('./routes/theaterRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
