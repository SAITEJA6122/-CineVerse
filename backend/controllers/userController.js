const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints || 0,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints || 0,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bookingHistory')
      .populate('favorites')
      .populate('recentlyViewed');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favorites.includes(req.params.movieId)) {
      user.favorites.push(req.params.movieId);
      await user.save();
    }
    const updatedUser = await User.findById(req.user._id).populate('favorites');
    res.json(updatedUser.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.movieId);
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('favorites');
    res.json(updatedUser.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Initialize recentlyViewed if it doesn't exist
    if (!user.recentlyViewed) {
      user.recentlyViewed = [];
    }
    user.recentlyViewed = user.recentlyViewed.filter(id => id.toString() !== req.params.movieId);
    user.recentlyViewed.unshift(req.params.movieId);
    user.recentlyViewed = user.recentlyViewed.slice(0, 10);
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('recentlyViewed');
    res.json(updatedUser.recentlyViewed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const redeemLoyaltyPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { points } = req.body;
    const pointsToRedeem = parseInt(points);
    if (pointsToRedeem > user.loyaltyPoints) {
      return res.status(400).json({ message: 'Not enough loyalty points' });
    }
    user.loyaltyPoints -= pointsToRedeem;
    await user.save();
    const discountAmount = pointsToRedeem / 100;
    res.json({
      loyaltyPoints: user.loyaltyPoints,
      discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  addToFavorites, 
  removeFromFavorites,
  addToRecentlyViewed,
  redeemLoyaltyPoints,
  getAllUsers,
  updateUser,
  deleteUser
};
