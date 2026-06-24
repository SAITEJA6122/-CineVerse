import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Mic, Clock, X, Star } from 'lucide-react';
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
  const [searchHistory, setSearchHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const recognitionRef = useRef(null);

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
      setMovies(data.movies || []);
      setIsDropdownOpen(true);
      
      // Add to search history
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 9)]);
      }
      
      // Generate suggestions based on results
      const genres = [...new Set(data.movies?.map(m => Array.isArray(m.genre) ? m.genre : [m.genre]).flat())];
      setSuggestions(genres.slice(0, 5));
    } catch (err) {
      setError('Failed to search movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, performSearch]);

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
      if (isListening) stopListening();
    }
  };

  // Voice search functionality
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const applySuggestion = (suggestion) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const getInputStyle = () => ({
    width: '100%',
    padding: '0.8rem 3.5rem 0.8rem 1.2rem',
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
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          id="movie-search"
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-label="Search movies"
          style={getInputStyle()}
        />
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          style={{
            position: 'absolute',
            right: '0.8rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isListening ? '#e94560' : theme === 'dark' ? '#aaa' : '#666',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title={isListening ? 'Stop listening' : 'Voice search'}
        >
          {isListening ? (
            <Mic size={18} style={{ animation: 'pulse 1s infinite' }} />
          ) : (
            <Mic size={18} />
          )}
        </button>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsDropdownOpen(false);
            }}
            style={{
              position: 'absolute',
              right: '2.8rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#aaa' : '#666',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

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

          {!loading && !error && query.trim() === '' && (
            <>
              {searchHistory.length > 0 && (
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: theme === 'dark' ? '#aaa' : '#666', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> Recent Searches
                    </span>
                    <button
                      onClick={clearHistory}
                      style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(item)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: theme === 'dark' ? '#f0f0f0' : '#333',
                        fontSize: '0.9rem',
                        borderRadius: '6px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#2a2a4a' : '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
              
              {suggestions.length > 0 && (
                <div style={{ padding: '1rem', borderTop: `1px solid ${theme === 'dark' ? '#2a2a4a' : '#f0f0f0'}` }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.5rem', display: 'block' }}>
                    Popular Genres
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestion(suggestion)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: theme === 'dark' ? '#2a2a4a' : '#f5f5f5',
                          border: 'none',
                          borderRadius: '15px',
                          cursor: 'pointer',
                          color: theme === 'dark' ? '#f0f0f0' : '#333',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = theme === 'dark' ? '#2a2a4a' : '#f5f5f5'}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
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
                      <Star size={14} fill="#ffc107" color="#ffc107" />
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
