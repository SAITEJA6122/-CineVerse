import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThemeContext from '../context/ThemeContext';
import API_BASE from '../config';

const Search = () => {
  const { theme } = useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setError(null);
      setIsDropdownOpen(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/movies/search`, {
        params: { q: searchQuery }
      });
      setMovies(data.movies);
      setIsDropdownOpen(true);
    } catch (err) {
      setError('Failed to search movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setQuery('');
    }
  };

  const getInputStyle = () => ({
    width: '100%',
    padding: '0.8rem 1.2rem',
    borderRadius: '25px',
    border: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`,
    background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
    color: theme === 'dark' ? '#f0f0f0' : '#333',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
  });

  const getDropdownStyle = () => ({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`,
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    marginTop: '0.5rem',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 1001
  });

  const getResultItemStyle = () => ({
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    cursor: 'pointer',
    borderBottom: `1px solid ${theme === 'dark' ? '#2a2a4a' : '#f0f0f0'}`,
    transition: 'background 0.2s ease',
    textDecoration: 'none'
  });

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <label htmlFor="movie-search" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        Search movies
      </label>
      <input
        ref={inputRef}
        id="movie-search"
        type="text"
        placeholder="Search for movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsDropdownOpen(true)}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-label="Search movies"
        style={getInputStyle()}
      />

      {isDropdownOpen && (
        <div style={getDropdownStyle()} role="listbox" aria-label="Search results">
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: theme === 'dark' ? '#aaa' : '#666' }}>
              Searching...
            </div>
          )}

          {error && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#e94560' }}>
              {error}
            </div>
          )}

          {!loading && !error && movies.length === 0 && query.trim() && (
            <div style={{ padding: '2rem', textAlign: 'center', color: theme === 'dark' ? '#aaa' : '#666' }}>
              No movies found
            </div>
          )}

          {!loading && !error && movies.length > 0 && (
            <>
              {movies.map((movie) => (
                <Link
                  key={movie._id}
                  to={`/movie/${movie._id}`}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setQuery('');
                  }}
                  style={getResultItemStyle()}
                  role="option"
                  aria-selected="false"
                  onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#2a2a4a' : '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img
                    src={movie.poster || 'https://picsum.photos/60/90?random=' + movie._id}
                    alt={movie.title}
                    style={{
                      width: '60px',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                    loading="lazy"
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: 0,
                      marginBottom: '0.3rem',
                      color: theme === 'dark' ? '#f0f0f0' : '#333',
                      fontSize: '1rem'
                    }}>
                      {movie.title}
                    </h4>
                    <p style={{
                      margin: 0,
                      marginBottom: '0.3rem',
                      color: theme === 'dark' ? '#aaa' : '#666',
                      fontSize: '0.85rem'
                    }}>
                      {new Date(movie.releaseDate).getFullYear()} • {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        color: '#ffc107',
                        fontWeight: 'bold'
                      }}>⭐</span>
                      <span style={{
                        color: theme === 'dark' ? '#f0f0f0' : '#333',
                        fontWeight: '600'
                      }}>
                        {movie.rating ? movie.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
