const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { mockUsers, mockMovies } = require('../mockData');

let useMockData = process.env.USE_MOCK_DATA !== 'false';
let currentMockUser = null;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    if (useMockData) {
      const { name, email, password } = req.body;
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
      const newUser = {
        _id: `user${Date.now()}`,
        name,
        email,
        password,
        role: 'user',
        favorites: [],
        recentlyViewed: [],
        bookingHistory: [],
        loyaltyPoints: 0
      };
      mockUsers.push(newUser);
      currentMockUser = newUser;
      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        loyaltyPoints: newUser.loyaltyPoints,
        token: generateToken(newUser._id)
      });
    }

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
    if (useMockData) {
      const { email, password } = req.body;
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        currentMockUser = user;
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints || 0,
          token: generateToken(user._id)
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

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
    if (useMockData) {
      const user = currentMockUser || mockUsers[0];
      const userWithPopulatedData = {
        ...user,
        favorites: user.favorites.map(favId => mockMovies.find(m => m._id === favId)),
        recentlyViewed: user.recentlyViewed.map(viewedId => mockMovies.find(m => m._id === viewedId)),
      };
      return res.json(userWithPopulatedData);
    }

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
    if (useMockData) {
      const user = currentMockUser || mockUsers[0];
      if (!user.favorites.includes(req.params.movieId)) {
        user.favorites.push(req.params.movieId);
      }
      const populatedFavorites = user.favorites.map(favId => mockMovies.find(m => m._id === favId));
      return res.json(populatedFavorites);
    }

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
    if (useMockData) {
      const user = currentMockUser || mockUsers[0];
      user.favorites = user.favorites.filter(id => id !== req.params.movieId);
      const populatedFavorites = user.favorites.map(favId => mockMovies.find(m => m._id === favId));
      return res.json(populatedFavorites);
    }

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
    if (useMockData) {
      const user = currentMockUser || mockUsers[0];
      user.recentlyViewed = user.recentlyViewed.filter(id => id !== req.params.movieId);
      user.recentlyViewed.unshift(req.params.movieId);
      user.recentlyViewed = user.recentlyViewed.slice(0, 10);
      const populatedRecentlyViewed = user.recentlyViewed.map(viewedId => mockMovies.find(m => m._id === viewedId));
      return res.json(populatedRecentlyViewed);
    }

    const user = await User.findById(req.user._id);
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
    if (useMockData) {
      const user = currentMockUser || mockUsers[0];
      const { points } = req.body;
      const pointsToRedeem = parseInt(points);
      if (pointsToRedeem > user.loyaltyPoints) {
        return res.status(400).json({ message: 'Not enough loyalty points' });
      }
      user.loyaltyPoints -= pointsToRedeem;
      // 100 points = $1 discount
      const discountAmount = pointsToRedeem / 100;
      return res.json({
        loyaltyPoints: user.loyaltyPoints,
        discountAmount
      });
    }

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
    if (useMockData) {
      return res.json(mockUsers);
    }
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    if (useMockData) {
      const userIndex = mockUsers.findIndex(u => u._id === req.params.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...req.body };
        return res.json(mockUsers[userIndex]);
      }
      return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (useMockData) {
      const userIndex = mockUsers.findIndex(u => u._id === req.params.id);
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        return res.json({ message: 'User deleted' });
      }
      return res.status(404).json({ message: 'User not found' });
    }
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
