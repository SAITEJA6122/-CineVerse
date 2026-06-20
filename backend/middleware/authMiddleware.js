const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { mockUsers } = require('../mockData');

let useMockData = process.env.USE_MOCK_DATA !== 'false';

const protect = async (req, res, next) => {
  if (useMockData) {
    // For mock data, we'll automatically set the user
    req.user = mockUsers[0];
    next();
    return;
  }

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (useMockData) {
    // Allow admin access in mock mode for testing
    next();
    return;
  }
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };
