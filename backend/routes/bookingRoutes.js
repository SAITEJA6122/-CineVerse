const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getUserBookings, cancelBooking, getAnalytics } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, admin, getBookings);
router.get('/mybookings', protect, getUserBookings);
router.get('/analytics', protect, admin, getAnalytics);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
