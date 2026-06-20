import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';

const API_BASE = 'http://localhost:5000/api';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Fantasy', 'Animation'];
  const languages = ['English', 'Hindi', 'Spanish', 'French', 'German'];

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (genreFilter) params.genre = genreFilter;
      if (languageFilter) params.language = languageFilter;
      if (minDuration) params.minDuration = minDuration;
      if (maxDuration) params.maxDuration = maxDuration;
      console.log('Fetching movies with params:', params);
      const { data } = await axios.get(`${API_BASE}/movies`, { params });
      console.log('Received movies data:', data);
      setMovies(data.movies || data);
    } catch (error) {
      showToast('Failed to fetch movies', 'error');
      console.error('Fetch movies error:', error);
    } finally {
      setLoading(false);
    }
  }, [search, genreFilter, languageFilter, minDuration, maxDuration, showToast]);

  const fetchTrending = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/trending`);
      setTrendingMovies(data);
    } catch (error) {
      console.error('Failed to fetch trending movies');
    }
  }, []);

  const fetchUpcoming = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/upcoming`);
      setUpcomingMovies(data);
    } catch (error) {
      console.error('Failed to fetch upcoming movies');
    }
  }, []);

  const fetchComingSoon = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/coming-soon`);
      setComingSoonMovies(data);
    } catch (error) {
      console.error('Failed to fetch coming soon movies');
    }
  }, []);

  const fetchRecommended = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/recommended`);
      setRecommendedMovies(data);
    } catch (error) {
      console.error('Failed to fetch recommended movies');
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    fetchTrending();
    fetchUpcoming();
    fetchComingSoon();
    fetchRecommended();
  }, [fetchTrending, fetchUpcoming, fetchComingSoon, fetchRecommended]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMovies();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, genreFilter, languageFilter, minDuration, maxDuration, fetchMovies]);

  const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = new Date(targetDate).getTime() - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, [targetDate]);

    return <span style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#66d9ff' : '#007bff' }}>{timeLeft}</span>;
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #e94560 100%)',
    color: 'white',
    padding: '5rem 0',
    textAlign: 'center'
  };

  const searchContainerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    marginTop: '2rem'
  };

  const inputStyle = {
    padding: '1.2rem',
    width: '100%',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1.1rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  };

  const filterContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '1.5rem',
    justifyContent: 'center'
  };

  const selectStyle = {
    padding: '0.8rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255,255,255,0.9)',
    color: 'black',
    fontSize: '1rem',
    cursor: 'pointer'
  };

  const sectionStyle = {
    marginTop: '4rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };

  return (
    <div>
      <section style={heroStyle}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>
            🎬 Welcome to CineVerse
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, marginBottom: '0.5rem' }}>
            Discover, Book, and Enjoy the Latest Movies
          </p>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
            Experience cinema like never before
          </p>
          
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="🔍 Search for movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
            
            <div style={filterContainerStyle}>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>

              <select
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                style={selectStyle}
              >
                <option value="">Min Duration</option>
                <option value="90">90+ min</option>
                <option value="120">120+ min</option>
                <option value="150">150+ min</option>
              </select>

              <select
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                style={selectStyle}
              >
                <option value="">Max Duration</option>
                <option value="120">120- min</option>
                <option value="150">150- min</option>
                <option value="180">180- min</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {trendingMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
              🔥 Trending Now
            </h2>
            <div style={gridStyle}>
              {trendingMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {upcomingMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
              📅 Upcoming Releases
            </h2>
            <div style={gridStyle}>
              {upcomingMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {comingSoonMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
              🎉 Coming Soon
            </h2>
            <div style={gridStyle}>
              {comingSoonMovies.map(movie => (
                <div key={movie._id}>
                  <MovieCard movie={movie} />
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <CountdownTimer targetDate={movie.comingSoonDate} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
            {search || genreFilter || languageFilter || minDuration || maxDuration ? '🔍 Search Results' : '🎥 All Movies'}
          </h2>
          
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: theme === 'dark' ? '#1e1e3a' : '#ffffff', borderRadius: '12px', height: '450px' }} className="skeleton" />
              ))}
            </div>
          ) : movies.length > 0 ? (
            <div style={gridStyle}>
              {movies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: theme === 'dark' ? '#aaa' : '#666' }}>
              <p style={{ fontSize: '1.2rem' }}>No movies found</p>
            </div>
          )}
        </section>

        {recommendedMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
              ⭐ Recommended For You
            </h2>
            <div style={gridStyle}>
              {recommendedMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
