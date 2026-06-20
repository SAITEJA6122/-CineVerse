const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const { mockBookings, mockShows, mockMovies, mockTheaters, mockUsers } = require('../mockData');

let useMockData = process.env.USE_MOCK_DATA !== 'false';

const getCancellationPolicy = (bookingDate, showDate) => {
  const now = new Date();
  const show = new Date(showDate);
  const hoursUntilShow = (show - now) / (1000 * 60 * 60);
  
  if (hoursUntilShow > 48) {
    return { feePercent: 10, canCancel: true, message: '10% cancellation fee' };
  } else if (hoursUntilShow > 24) {
    return { feePercent: 30, canCancel: true, message: '30% cancellation fee' };
  } else if (hoursUntilShow > 6) {
    return { feePercent: 50, canCancel: true, message: '50% cancellation fee' };
  } else {
    return { feePercent: 100, canCancel: false, message: 'Cannot cancel within 6 hours of show' };
  }
};

const createBooking = async (req, res) => {
  try {
    if (useMockData) {
      const { show, selectedSeats } = req.body;
      const showData = mockShows.find(s => s._id === show);
      const movie = mockMovies.find(m => m._id === showData.movie);
      const theater = mockTheaters.find(t => t._id === showData.theater);
      const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
      const newBooking = {
        _id: `booking${Date.now()}`,
        user: req.user._id,
        movie: showData.movie,
        theater: showData.theater,
        show,
        selectedSeats,
        ticketPrice: showData.price,
        totalAmount,
        status: 'confirmed',
        bookingDate: new Date(),
        userPopulated: req.user,
        movie,
        theater,
        show: { ...showData, movie, theater }
      };
      mockBookings.push(newBooking);
      req.user.bookingHistory.push(newBooking._id);
      // Add loyalty points: 10 points per $1 spent
      const pointsEarned = Math.floor(totalAmount * 10);
      req.user.loyaltyPoints = (req.user.loyaltyPoints || 0) + pointsEarned;
      return res.status(201).json(newBooking);
    }

    const { show, selectedSeats } = req.body;
    const showData = await Show.findById(show).populate('movie').populate('theater');
    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    
    const newAvailableSeats = showData.availableSeats.map(row => [...row]);
    selectedSeats.forEach(seat => {
      newAvailableSeats[seat.row][seat.seat] = false;
    });
    await Show.findByIdAndUpdate(show, { availableSeats: newAvailableSeats });
    
    const booking = await Booking.create({
      user: req.user._id,
      movie: showData.movie._id,
      theater: showData.theater._id,
      show,
      selectedSeats,
      ticketPrice: showData.price,
      totalAmount
    });
    
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookingHistory: booking._id },
      $inc: { loyaltyPoints: Math.floor(totalAmount * 10) }
    });
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user')
      .populate('movie')
      .populate('theater')
      .populate('show');
    
    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    if (useMockData) {
      const populatedBookings = mockBookings.map(booking => {
        const movie = mockMovies.find(m => m._id === booking.movie);
        const theater = mockTheaters.find(t => t._id === booking.theater);
        const show = mockShows.find(s => s._id === booking.show);
        const user = mockUsers.find(u => u._id === booking.user);
        return {
          ...booking,
          user,
          movie,
          theater,
          show
        };
      });
      return res.json(populatedBookings);
    }

    const bookings = await Booking.find()
      .populate('user')
      .populate('movie')
      .populate('theater')
      .populate('show');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    if (useMockData) {
      const userBookings = mockBookings.filter(b => b.user === req.user._id);
      const populatedBookings = userBookings.map(booking => {
        const movie = mockMovies.find(m => m._id === booking.movie);
        const theater = mockTheaters.find(t => t._id === booking.theater);
        const show = mockShows.find(s => s._id === booking.show);
        return {
          ...booking,
          movie,
          theater,
          show
        };
      });
      return res.json(populatedBookings);
    }

    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie')
      .populate('theater')
      .populate('show');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    if (useMockData) {
      const booking = mockBookings.find(b => b._id === req.params.id);
      if (booking && booking.user === req.user._id) {
        const policy = getCancellationPolicy(booking.bookingDate, booking.show.date);
        if (!policy.canCancel) {
          return res.status(400).json({ message: policy.message });
        }
        
        const feeAmount = (booking.totalAmount * policy.feePercent) / 100;
        const refundAmount = booking.totalAmount - feeAmount;
        booking.status = 'cancelled';
        booking.cancellationFee = feeAmount;
        booking.refundAmount = refundAmount;
        
        // Return loyalty points
        const pointsToRemove = Math.floor(booking.totalAmount * 10);
        req.user.loyaltyPoints = Math.max(0, (req.user.loyaltyPoints || 0) - pointsToRemove);
        
        // Make seats available again
        const show = mockShows.find(s => s._id === booking.show);
        if (show) {
          booking.selectedSeats.forEach(seat => {
            show.availableSeats[seat.row][seat.seat] = true;
          });
        }
        
        return res.json({
          ...booking,
          cancellationPolicy: policy
        });
      }
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (booking && booking.user.toString() === req.user._id.toString()) {
      const show = await Show.findById(booking.show);
      const policy = getCancellationPolicy(booking.bookingDate, show.date);
      
      if (!policy.canCancel) {
        return res.status(400).json({ message: policy.message });
      }
      
      booking.status = 'cancelled';
      booking.cancellationFee = (booking.totalAmount * policy.feePercent) / 100;
      booking.refundAmount = booking.totalAmount - booking.cancellationFee;
      await booking.save();
      
      const newAvailableSeats = show.availableSeats.map(row => [...row]);
      booking.selectedSeats.forEach(seat => {
        newAvailableSeats[seat.row][seat.seat] = true;
      });
      await Show.findByIdAndUpdate(booking.show, { availableSeats: newAvailableSeats });
      
      // Return loyalty points
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { loyaltyPoints: -Math.floor(booking.totalAmount * 10) }
      });
      
      const populatedBooking = await Booking.findById(req.params.id)
        .populate('user')
        .populate('movie')
        .populate('theater')
        .populate('show');
      
      res.json({
        ...populatedBooking._doc,
        cancellationPolicy: policy
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    if (useMockData) {
      return res.json({
        totalUsers: mockUsers.length,
        totalMovies: mockMovies.length,
        totalBookings: mockBookings.length,
        totalConfirmedBookings: mockBookings.filter(b => b.status === 'confirmed').length,
        totalRevenue: mockBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0)
      });
    }

    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalConfirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const bookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    res.json({
      totalUsers,
      totalMovies,
      totalBookings,
      totalConfirmedBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createBooking, 
  getBookings, 
  getUserBookings, 
  cancelBooking,
  getAnalytics
};
