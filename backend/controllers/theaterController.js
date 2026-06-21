const Theater = require('../models/Theater');

const getTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (theater) {
      res.json(theater);
    } else {
      res.status(404).json({ message: 'Theater not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTheater = async (req, res) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json(theater);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (theater) {
      res.json(theater);
    } else {
      res.status(404).json({ message: 'Theater not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (theater) {
      res.json({ message: 'Theater deleted' });
    } else {
      res.status(404).json({ message: 'Theater not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTheaters, getTheaterById, createTheater, updateTheater, deleteTheater };
