import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
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
      if (genreFilter) params.genre = genreFilter;
      if (languageFilter) params.language = languageFilter;
      if (minDuration) params.minDuration = minDuration;
      if (maxDuration) params.maxDuration = maxDuration;
      const { data } = await axios.get(`${API_BASE}/movies`, { params });
      setMovies(data.movies || data);
    } catch (error) {
      showToast('Failed to fetch movies', 'error');
    } finally {
      setLoading(false);
    }
  }, [genreFilter, languageFilter, minDuration, maxDuration, showToast]);

  const fetchTrending = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/trending`);
      setTrendingMovies(data);
    } catch (error) {
      console.error('Failed to fetch trending movies:', error.message, error.response?.data);
    }
  }, []);

  const fetchUpcoming = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/upcoming`);
      setUpcomingMovies(data);
    } catch (error) {
      console.error('Failed to fetch upcoming movies:', error.message, error.response?.data);
    }
  }, []);

  const fetchComingSoon = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/coming-soon`);
      setComingSoonMovies(data);
    } catch (error) {
      console.error('Failed to fetch coming soon movies:', error.message, error.response?.data);
    }
  }, []);

  const fetchRecommended = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/recommended`);
      setRecommendedMovies(data);
    } catch (error) {
      console.error('Failed to fetch recommended movies:', error.message, error.response?.data);
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
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [genreFilter, languageFilter, minDuration, maxDuration, fetchMovies]);

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

    return <span style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#66d9ff' : '#007bff', fontWeight: '600' }}>{timeLeft}</span>;
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #e94560 100%)',
    color: 'white',
    padding: '6rem 0',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
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
    borderRadius: 'var(--radius-md)',
    border: '2px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.95)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const sectionStyle = {
    marginTop: '4.5rem',
    marginBottom: '1rem'
  };

  const sectionHeadingStyle = {
    fontSize: '2.1rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: 'inherit'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '2rem'
  };

  const noResultsStyle = {
    textAlign: 'center',
    padding: '5rem 1rem',
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
  };

  return (
    <div>
      <section style={heroStyle} className="fade-in">
        <div className="container">
          <h1 style={{ fontSize: '3.2rem', marginBottom: '1rem', fontWeight: '800', lineHeight: '1.2' }}>
            🎬 Welcome to CineVerse
          </h1>
          <p style={{ fontSize: '1.4rem', opacity: 0.95, marginBottom: '0.5rem', fontWeight: '500' }}>
            Discover, Book, and Enjoy the Latest Movies
          </p>
          <p style={{ opacity: 0.85, marginBottom: '2.5rem', fontSize: '1.1rem' }}>
            Experience cinema like never before
          </p>
          
          <div style={{ maxWidth: '950px', margin: '0 auto' }}>
            <div style={filterContainerStyle}>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                style={{ ...selectStyle, minWidth: '160px' }}
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                style={{ ...selectStyle, minWidth: '160px' }}
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>

              <select
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                style={{ ...selectStyle, minWidth: '140px' }}
              >
                <option value="">Min Duration</option>
                <option value="90">90+ min</option>
                <option value="120">120+ min</option>
                <option value="150">150+ min</option>
              </select>

              <select
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                style={{ ...selectStyle, minWidth: '140px' }}
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
            <h2 style={sectionHeadingStyle}>🔥 Trending Now</h2>
            <div style={gridStyle}>
              {trendingMovies.map((movie, index) => (
                <MovieCard key={movie._id} movie={movie} delay={index * 80} />
              ))}
            </div>
          </section>
        )}

        {upcomingMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>📅 Upcoming Releases</h2>
            <div style={gridStyle}>
              {upcomingMovies.map((movie, index) => (
                <MovieCard key={movie._id} movie={movie} delay={index * 80} />
              ))}
            </div>
          </section>
        )}

        {comingSoonMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>🎉 Coming Soon</h2>
            <div style={gridStyle}>
              {comingSoonMovies.map((movie, index) => (
                <div key={movie._id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <MovieCard movie={movie} delay={index * 80} />
                  <div style={{ 
                    textAlign: 'center', 
                    marginTop: '1rem', 
                    padding: '0.7rem',
                    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
                  }}>
                    <CountdownTimer targetDate={movie.comingSoonDate} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>
            {genreFilter || languageFilter || minDuration || maxDuration ? '🔍 Filter Results' : '🎥 All Movies'}
          </h2>
          
          {loading ? (
            <div style={gridStyle}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ height: '480px', borderRadius: 'var(--radius-lg)' }} className="skeleton card" />
              ))}
            </div>
          ) : movies.length > 0 ? (
            <div style={gridStyle}>
              {movies.map((movie, index) => (
                <MovieCard key={movie._id} movie={movie} delay={index * 80} />
              ))}
            </div>
          ) : (
            <div style={noResultsStyle}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</div>
              <p style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: '600' }}>No movies found</p>
              <p style={{ fontSize: '1rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>Try adjusting your filters</p>
            </div>
          )}
        </section>

        {recommendedMovies.length > 0 && (
          <section style={{ ...sectionStyle, marginBottom: '4rem' }}>
            <h2 style={sectionHeadingStyle}>⭐ Recommended For You</h2>
            <div style={gridStyle}>
              {recommendedMovies.map((movie, index) => (
                <MovieCard key={movie._id} movie={movie} delay={index * 80} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
