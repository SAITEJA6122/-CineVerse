const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/favorites/:movieId', protect, addToFavorites);
router.delete('/favorites/:movieId', protect, removeFromFavorites);
router.post('/recently-viewed/:movieId', protect, addToRecentlyViewed);
router.post('/redeem-points', protect, redeemLoyaltyPoints);
router.get('/', protect, admin, getAllUsers);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
