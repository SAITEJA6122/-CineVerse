import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Play, TrendingUp, Calendar as CalendarIcon, Sparkles, Star, Users, Film, Flame } from 'lucide-react';
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
  const [minRating, setMinRating] = useState(0);
  const [releaseDateFrom, setReleaseDateFrom] = useState('');
  const [releaseDateTo, setReleaseDateTo] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [savedPresets, setSavedPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Fantasy', 'Animation'];
  const languages = ['English', 'Hindi', 'Spanish', 'French', 'German'];

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGenres.length > 0) params.genres = selectedGenres.join(',');
      if (languageFilter) params.language = languageFilter;
      if (minDuration) params.minDuration = minDuration;
      if (maxDuration) params.maxDuration = maxDuration;
      if (minRating > 0) params.minRating = minRating;
      if (releaseDateFrom) params.releaseDateFrom = releaseDateFrom;
      if (releaseDateTo) params.releaseDateTo = releaseDateTo;
      const { data } = await axios.get(`${API_BASE}/movies`, { params });
      setMovies(data.movies || data);
    } catch (error) {
      showToast('Failed to fetch movies', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedGenres, languageFilter, minDuration, maxDuration, minRating, releaseDateFrom, releaseDateTo, showToast]);

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

  // Auto-rotate carousel
  useEffect(() => {
    const featuredMovies = [...trendingMovies, ...upcomingMovies].slice(0, 5);
    if (featuredMovies.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [trendingMovies, upcomingMovies]);

  const featuredMovies = [...trendingMovies, ...upcomingMovies].slice(0, 5);
  const currentMovie = featuredMovies[currentSlide] || featuredMovies[0];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMovies();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedGenres, languageFilter, minDuration, maxDuration, minRating, releaseDateFrom, releaseDateTo, fetchMovies]);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const savePreset = () => {
    const preset = {
      id: Date.now(),
      name: `Preset ${savedPresets.length + 1}`,
      genres: selectedGenres,
      language: languageFilter,
      minDuration,
      maxDuration,
      minRating,
      releaseDateFrom,
      releaseDateTo
    };
    setSavedPresets([...savedPresets, preset]);
    showToast('Filter preset saved', 'success');
  };

  const loadPreset = (preset) => {
    setSelectedGenres(preset.genres || []);
    setLanguageFilter(preset.language || '');
    setMinDuration(preset.minDuration || '');
    setMaxDuration(preset.maxDuration || '');
    setMinRating(preset.minRating || 0);
    setReleaseDateFrom(preset.releaseDateFrom || '');
    setReleaseDateTo(preset.releaseDateTo || '');
    showToast('Preset loaded', 'success');
  };

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
    background: currentMovie?.poster 
      ? `linear-gradient(to bottom, rgba(15, 15, 35, 0.7), rgba(15, 15, 35, 0.95)), url(${currentMovie.poster}) center/cover no-repeat`
      : 'var(--gradient-hero)',
    color: 'white',
    padding: '6rem 0',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    position: 'relative',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden'
  };

  const carouselButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 10
  };

  const carouselButtonHoverStyle = {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-50%) scale(1.1)'
  };

  const trailerButtonStyle = {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    border: 'none',
    padding: '0.8rem 2rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)'
  };

  const filterContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '1.5rem',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const genreChipStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    background: selectedGenres.includes('') ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500'
  };

  const activeGenreChipStyle = {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'white'
  };

  const sliderStyle = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.3)',
    outline: 'none',
    cursor: 'pointer'
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
        {currentMovie?.trailer && (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              opacity: 0.3
            }}
          >
            <source src={currentMovie.trailer} type="video/mp4" />
          </video>
        )}
        {featuredMovies.length > 1 && (
          <>
            <button 
              style={{ ...carouselButtonStyle, left: '20px', zIndex: 20 }}
              onMouseEnter={(e) => Object.assign(e.target.style, carouselButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, carouselButtonStyle)}
              onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              style={{ ...carouselButtonStyle, right: '20px', zIndex: 20 }}
              onMouseEnter={(e) => Object.assign(e.target.style, carouselButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, carouselButtonStyle)}
              onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredMovies.length)}
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        <div className="container">
          {currentMovie ? (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '1.5rem',
                animation: 'fadeIn 0.5s ease-out'
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {currentMovie.isTrending && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(233, 69, 96, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}><Flame size={14} /> Trending</span>}
                  {currentMovie.isUpcoming && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 193, 7, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}><CalendarIcon size={14} /> Upcoming</span>}
                  {currentMovie.isComingSoon && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(124, 77, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}><Sparkles size={14} /> Coming Soon</span>}
                </div>
                <h1 style={{ fontSize: '3.2rem', marginBottom: '0.5rem', fontWeight: '800', lineHeight: '1.2' }}>
                  {currentMovie.title}
                </h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '0.5rem', fontWeight: '500', maxWidth: '700px' }}>
                  {currentMovie.description?.substring(0, 150)}{currentMovie.description?.length > 150 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1rem' }}><Star size={16} fill="currentColor" /> {currentMovie.rating?.toFixed(1) || 'N/A'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1rem' }}><Users size={16} /> 10,000+ bookings today</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {currentMovie.trailer && (
                    <button style={trailerButtonStyle} onClick={() => window.open(currentMovie.trailer, '_blank')}>
                      <Play size={18} /> Watch Trailer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '3.2rem', marginBottom: '1rem', fontWeight: '800', lineHeight: '1.2' }}>
                Welcome to CineVerse
              </h1>
              <p style={{ fontSize: '1.4rem', opacity: 0.95, marginBottom: '0.5rem', fontWeight: '500' }}>
                Discover, Book, and Enjoy the Latest Movies
              </p>
              <p style={{ opacity: 0.85, marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                Experience cinema like never before
              </p>
            </>
          )}
          
          <div style={{ maxWidth: '950px', margin: '0 auto' }}>
            <div style={filterContainerStyle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    style={{
                      ...genreChipStyle,
                      ...(selectedGenres.includes(genre) ? activeGenreChipStyle : {})
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Rating: {minRating}+</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  style={sliderStyle}
                />
              </div>

              <input
                type="date"
                value={releaseDateFrom}
                onChange={(e) => setReleaseDateFrom(e.target.value)}
                style={{ ...selectStyle, minWidth: '140px' }}
                placeholder="From"
              />

              <input
                type="date"
                value={releaseDateTo}
                onChange={(e) => setReleaseDateTo(e.target.value)}
                style={{ ...selectStyle, minWidth: '140px' }}
                placeholder="To"
              />

              <button
                onClick={savePreset}
                style={{ ...trailerButtonStyle, padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
              >
                Save Preset
              </button>
            </div>

            {savedPresets.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', marginRight: '0.5rem' }}>Saved Presets:</span>
                {savedPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '15px',
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        {trendingMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}><TrendingUp size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Trending Now</h2>
            <div style={gridStyle}>
              {trendingMovies.map((movie, index) => (
                <MovieCard key={movie._id} movie={movie} delay={index * 80} />
              ))}
            </div>
          </section>
        )}

        {upcomingMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}><CalendarIcon size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Upcoming Releases</h2>
            <div style={gridStyle}>
              {upcomingMovies.map((movie, index) => (
                <MovieCard key={movie._id} movie={movie} delay={index * 80} />
              ))}
            </div>
          </section>
        )}

        {comingSoonMovies.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}><Sparkles size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Coming Soon</h2>
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
            {genreFilter || languageFilter || minDuration || maxDuration ? 'Filter Results' : 'All Movies'}
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
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}><Film size={64} /></div>
              <p style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: '600' }}>No movies found</p>
              <p style={{ fontSize: '1rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>Try adjusting your filters</p>
            </div>
          )}
        </section>

        {recommendedMovies.length > 0 && (
          <section style={{ ...sectionStyle, marginBottom: '4rem' }}>
            <h2 style={sectionHeadingStyle}><Star size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Recommended For You</h2>
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
