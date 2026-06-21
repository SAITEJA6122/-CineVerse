const Movie = require('../models/Movie');
const { generatePosterUrl } = require('../utils/imageGenerator');

const convertToYouTubeEmbed = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};

const getMovies = async (req, res) => {
  try {
    let query = {};
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.genre) {
      const genresArray = req.query.genre.split(',');
      query.genre = { $in: genresArray };
    }
    if (req.query.language) {
      query.language = req.query.language;
    }
    if (req.query.minDuration) {
      query.duration = { ...query.duration, $gte: parseInt(req.query.minDuration) };
    }
    if (req.query.maxDuration) {
      query.duration = { ...query.duration, $lte: parseInt(req.query.maxDuration) };
    }
    const movies = await Movie.find(query);
    const total = await Movie.countDocuments(query);
    
    res.json({
      total,
      movies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMovies = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    if (!searchQuery.trim()) {
      return res.json({ total: 0, movies: [] });
    }
    
    // Search in title, description, genre, cast
    const searchConditions = {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { genre: { $in: [new RegExp(searchQuery, 'i')] } },
        { cast: { $in: [new RegExp(searchQuery, 'i')] } }
      ]
    };
    
    const movies = await Movie.find(searchConditions);
    
    // Weighted scoring
    const now = new Date();
    const scoredMovies = movies.map(movie => {
      let score = 0;
      
      // 1. Rating (weight: 40% max)
      const ratingScore = (movie.rating / 5) * 40;
      
      // 2. Release recency (weight: 30% max)
      const releaseDate = new Date(movie.releaseDate);
      const daysSinceRelease = Math.max(0, (now - releaseDate) / (1000 * 60 * 60 * 24));
      // Exponential decay: newer movies get more points
      const recencyScore = Math.max(0, 30 * Math.exp(-daysSinceRelease / 365));
      
      // 3. View count (weight: 20% max)
      const maxViews = movies.reduce((max, m) => Math.max(max, m.viewCount), 1);
      const viewScore = (movie.viewCount / maxViews) * 20;
      
      // 4. Title match bonus (weight: 10%)
      const titleMatch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const titleScore = titleMatch ? 10 : 0;
      
      score = ratingScore + recencyScore + viewScore + titleScore;
      
      return { ...movie.toObject(), score };
    });
    
    // Sort by score descending and limit to top 10
    scoredMovies.sort((a, b) => b.score - a.score);
    const topMovies = scoredMovies.slice(0, 10);
    
    res.json({ total: movies.length, movies: topMovies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMovie = async (req, res) => {
  try {
    const { 
      title, description, genre, language, duration, releaseDate, cast, 
      trailerUrl, posterUrl, rating, isTrending, isUpcoming, isComingSoon, isRecommended 
    } = req.body;

    const parsedGenres = Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim());
    
    let finalPoster = posterUrl;
    if (!finalPoster || finalPoster.trim() === '') {
      try {
        finalPoster = generatePosterUrl(title, parsedGenres);
      } catch (error) {
        console.warn('Failed to auto-generate poster, using fallback:', error.message);
        finalPoster = 'https://picsum.photos/400/600?random=' + Date.now();
      }
    }
    
    const poster = req.file ? `/uploads/${req.file.filename}` : finalPoster;
    const movie = await Movie.create({
      title,
      description,
      genre: parsedGenres,
      language,
      duration,
      releaseDate,
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map(c => c.trim()) : []),
      trailer: convertToYouTubeEmbed(trailerUrl),
      poster,
      rating,
      isTrending,
      isUpcoming,
      isComingSoon,
      isRecommended
    });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMovie = async (req, res) => {
  try {
    const { 
      title, description, genre, language, duration, releaseDate, cast, 
      trailerUrl, posterUrl, rating, isTrending, isUpcoming, isComingSoon, isRecommended 
    } = req.body;
    
    const updateData = {
      title,
      description,
      language,
      duration,
      releaseDate,
      trailer: convertToYouTubeEmbed(trailerUrl),
      rating,
      isTrending,
      isUpcoming,
      isComingSoon,
      isRecommended
    };
    
    if (genre) updateData.genre = Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim());
    if (cast) updateData.cast = Array.isArray(cast) ? cast : cast.split(',').map(c => c.trim());
    
    if (req.file) {
      updateData.poster = `/uploads/${req.file.filename}`;
    } else if (posterUrl && posterUrl.trim() !== '') {
      updateData.poster = posterUrl;
    } else {
      const currentMovie = await Movie.findById(req.params.id);
      if (!currentMovie.poster || currentMovie.poster.trim() === '') {
        const parsedGenres = genre 
          ? (Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim())) 
          : currentMovie.genre;
        const finalTitle = title || currentMovie.title;
        try {
          updateData.poster = generatePosterUrl(finalTitle, parsedGenres);
        } catch (error) {
          console.warn('Failed to auto-generate poster, using fallback:', error.message);
          updateData.poster = 'https://picsum.photos/400/600?random=' + Date.now();
        }
      }
    }
    
    const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (movie) {
      res.json({ message: 'Movie deleted' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendingMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isTrending: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUpcomingMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isUpcoming: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComingSoonMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isComingSoon: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isRecommended: true });
    res.json(movies.length > 0 ? movies : await Movie.find().sort({ rating: -1 }).limit(4));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSimilarMovies = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie && movie.similarMovies) {
      const similar = await Movie.find({ _id: { $in: movie.similarMovies } });
      return res.json(similar);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      movie.reviews.push(req.body);
      await movie.save();
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getTrendingMovies,
  getUpcomingMovies,
  getComingSoonMovies,
  getRecommendedMovies,
  getSimilarMovies,
  addReview,
  searchMovies
};
