const express = require('express');
const router = express.Router();
const { getTheaters, getTheaterById, createTheater, updateTheater, deleteTheater } = require('../controllers/theaterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTheaters);
router.get('/:id', getTheaterById);
router.post('/', protect, admin, createTheater);
router.put('/:id', protect, admin, updateTheater);
router.delete('/:id', protect, admin, deleteTheater);

module.exports = router;
