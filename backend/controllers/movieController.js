const Movie = require('../models/Movie');
const { mockMovies } = require('../mockData');

let useMockData = process.env.USE_MOCK_DATA !== 'false';

const getMovies = async (req, res) => {
  try {
    if (useMockData) {
      let movies = [...mockMovies];
      const { search, genre, language, minDuration, maxDuration } = req.query;
      
      if (search) {
        movies = movies.filter(m => 
          m.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (genre) {
        const genresArray = genre.split(',');
        movies = movies.filter(m => 
          m.genre.some(g => genresArray.includes(g))
        );
      }
      
      if (language) {
        movies = movies.filter(m => m.language === language);
      }
      
      if (minDuration) {
        movies = movies.filter(m => m.duration >= parseInt(minDuration));
      }
      
      if (maxDuration) {
        movies = movies.filter(m => m.duration <= parseInt(maxDuration));
      }
      
      return res.json({
        total: movies.length,
        movies: movies
      });
    }
    
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
    if (useMockData) {
      const movie = mockMovies.find(m => m._id === req.params.id);
      if (movie) {
        return res.json(movie);
      }
      return res.status(404).json({ message: 'Movie not found' });
    }
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
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
    
    if (useMockData) {
      const newMovie = {
        _id: `movie${Date.now()}`,
        title,
        description,
        genre: Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim()),
        language,
        duration: Number(duration),
        releaseDate,
        cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map(c => c.trim()) : []),
        trailer: trailerUrl || '',
        poster: posterUrl || 'https://picsum.photos/400/600?random=' + Date.now(),
        rating: rating || 0,
        isTrending: isTrending || false,
        isUpcoming: isUpcoming || false,
        isComingSoon: isComingSoon || false,
        isRecommended: isRecommended || false,
        reviews: [],
        similarMovies: []
      };
      mockMovies.push(newMovie);
      return res.status(201).json(newMovie);
    }
    
    const poster = req.file ? `/uploads/${req.file.filename}` : (posterUrl || '');
    const movie = await Movie.create({
      title,
      description,
      genre: Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim()),
      language,
      duration,
      releaseDate,
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map(c => c.trim()) : []),
      trailer: trailerUrl,
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
    
    if (useMockData) {
      const movieIndex = mockMovies.findIndex(m => m._id === req.params.id);
      if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      
      const updatedMovie = {
        ...mockMovies[movieIndex],
        title: title || mockMovies[movieIndex].title,
        description: description || mockMovies[movieIndex].description,
        language: language || mockMovies[movieIndex].language,
        duration: duration ? Number(duration) : mockMovies[movieIndex].duration,
        releaseDate: releaseDate || mockMovies[movieIndex].releaseDate,
        rating: rating !== undefined ? Number(rating) : mockMovies[movieIndex].rating,
        isTrending: isTrending !== undefined ? isTrending : mockMovies[movieIndex].isTrending,
        isUpcoming: isUpcoming !== undefined ? isUpcoming : mockMovies[movieIndex].isUpcoming,
        isComingSoon: isComingSoon !== undefined ? isComingSoon : mockMovies[movieIndex].isComingSoon,
        isRecommended: isRecommended !== undefined ? isRecommended : mockMovies[movieIndex].isRecommended
      };
      
      if (genre) updatedMovie.genre = Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim());
      if (cast) updatedMovie.cast = Array.isArray(cast) ? cast : cast.split(',').map(c => c.trim());
      if (trailerUrl) updatedMovie.trailer = trailerUrl;
      if (posterUrl) updatedMovie.poster = posterUrl;
      
      mockMovies[movieIndex] = updatedMovie;
      return res.json(updatedMovie);
    }
    
    const updateData = {
      title,
      description,
      language,
      duration,
      releaseDate,
      trailer: trailerUrl,
      rating,
      isTrending,
      isUpcoming,
      isComingSoon,
      isRecommended
    };
    if (genre) updateData.genre = Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim());
    if (cast) updateData.cast = Array.isArray(cast) ? cast : cast.split(',').map(c => c.trim());
    if (posterUrl) updateData.poster = posterUrl;
    if (req.file) updateData.poster = `/uploads/${req.file.filename}`;
    
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
    if (useMockData) {
      const movieIndex = mockMovies.findIndex(m => m._id === req.params.id);
      if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      mockMovies.splice(movieIndex, 1);
      return res.json({ message: 'Movie deleted' });
    }
    
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
    if (useMockData) {
      return res.json(mockMovies.filter(m => m.isTrending));
    }
    const movies = await Movie.find({ isTrending: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUpcomingMovies = async (req, res) => {
  try {
    if (useMockData) {
      return res.json(mockMovies.filter(m => m.isUpcoming));
    }
    const movies = await Movie.find({ isUpcoming: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComingSoonMovies = async (req, res) => {
  try {
    if (useMockData) {
      return res.json(mockMovies.filter(m => m.isComingSoon));
    }
    const movies = await Movie.find({ isComingSoon: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendedMovies = async (req, res) => {
  try {
    if (useMockData) {
      const recommended = mockMovies.filter(m => m.isRecommended);
      return res.json(recommended.length > 0 ? recommended : mockMovies.slice(0, 4));
    }
    const movies = await Movie.find({ isRecommended: true });
    res.json(movies.length > 0 ? movies : await Movie.find().sort({ rating: -1 }).limit(4));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSimilarMovies = async (req, res) => {
  try {
    if (useMockData) {
      const movie = mockMovies.find(m => m._id === req.params.id);
      if (movie && movie.similarMovies) {
        const similar = movie.similarMovies.map(id => mockMovies.find(m => m._id === id)).filter(Boolean);
        return res.json(similar);
      }
      return res.json([]);
    }
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
    if (useMockData) {
      const { user, rating, comment } = req.body;
      const movie = mockMovies.find(m => m._id === req.params.id);
      if (movie) {
        movie.reviews.push({
          user,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0]
        });
        return res.json(movie);
      }
      return res.status(404).json({ message: 'Movie not found' });
    }
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
  addReview
};
