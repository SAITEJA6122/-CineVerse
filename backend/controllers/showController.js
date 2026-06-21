const Show = require('../models/Show');

const getShows = async (req, res) => {
  try {
    const { movie, theater, date } = req.query;
    let query = {};
    if (movie) query.movie = movie;
    if (theater) query.theater = theater;
    if (date) query.date = new Date(date);
    const shows = await Show.find(query).populate('movie').populate('theater');
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('movie').populate('theater');
    if (show) {
      res.json(show);
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createShow = async (req, res) => {
  try {
    const { theater, screenNumber, date, time, price } = req.body;
    const theaterData = await require('../models/Theater').findById(theater);
    const screen = theaterData.screens.find(s => s.screenNumber === screenNumber);
    const availableSeats = Array(screen.seatLayout.rows).fill(null).map(() => Array(screen.seatLayout.seatsPerRow).fill(true));
    const show = await Show.create({ ...req.body, availableSeats });
    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (show) {
      res.json(show);
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (show) {
      res.json({ message: 'Show deleted' });
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShows, getShowById, createShow, updateShow, deleteShow };
