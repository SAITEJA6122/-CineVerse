const express = require('express');
const router = express.Router();
const { getShows, getShowById, createShow, updateShow, deleteShow } = require('../controllers/showController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getShows);
router.get('/:id', getShowById);
router.post('/', protect, admin, createShow);
router.put('/:id', protect, admin, updateShow);
router.delete('/:id', protect, admin, deleteShow);

module.exports = router;
