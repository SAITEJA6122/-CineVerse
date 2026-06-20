const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { 
  getMovies, 
  getMovieById, 
  createMovie, 
  updateMovie, 
  deleteMovie, 
  addReview,
  getTrendingMovies,
  getUpcomingMovies,
  getRecommendedMovies,
  getComingSoonMovies,
  getSimilarMovies
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

// Make multer optional - handle both JSON and FormData
const optionalUpload = (req, res, next) => {
  const multerUpload = upload.single('poster');
  multerUpload(req, res, (err) => {
    // Ignore multer errors if no file is uploaded, proceed
    next();
  });
};

router.get('/', getMovies);
router.get('/trending', getTrendingMovies);
router.get('/upcoming', getUpcomingMovies);
router.get('/coming-soon', getComingSoonMovies);
router.get('/recommended', getRecommendedMovies);
router.get('/:id/similar', getSimilarMovies);
router.get('/:id', getMovieById);
router.post('/', protect, admin, optionalUpload, createMovie);
router.put('/:id', protect, admin, optionalUpload, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
