import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import AuthContext from '../context/AuthContext';
import API_BASE from '../config';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [favorites, setFavorites] = useState([]);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const { user, getAuthHeaders } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeaders() });
      const favoriteIds = (data.favorites || []).map(f => f._id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites');
    }
  }, [user, getAuthHeaders]);

  const fetchMovie = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/${id}`);
      setMovie(data);
    } catch (error) {
      showToast('Failed to fetch movie details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  const fetchShows = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/shows`, { params: { movie: id } });
      setShows(data);
      if (data.length > 0) setSelectedShow(data[0]);
    } catch (error) {
      console.error('Failed to fetch shows');
    }
  }, [id]);

  const fetchSimilarMovies = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/${id}/similar`);
      setSimilarMovies(data);
    } catch (error) {
      console.error('Failed to fetch similar movies');
    }
  }, [id]);

  const addToRecentlyViewed = useCallback(async () => {
    if (!user) return;
    try {
      await axios.post(`${API_BASE}/users/recently-viewed/${id}`, {}, { headers: getAuthHeaders() });
    } catch (error) {
      console.error('Failed to add to recently viewed');
    }
  }, [id, user, getAuthHeaders]);

  useEffect(() => {
    fetchMovie();
    fetchShows();
    fetchSimilarMovies();
    addToRecentlyViewed();
    fetchFavorites();
  }, [fetchMovie, fetchShows, fetchSimilarMovies, addToRecentlyViewed, fetchFavorites]);

  const toggleFavorite = async () => {
    if (!user) {
      showToast('Please login to add to favorites', 'warning');
      navigate('/login');
      return;
    }
    try {
      let response;
      if (favorites.includes(id)) {
        response = await axios.delete(`${API_BASE}/users/favorites/${id}`, { headers: getAuthHeaders() });
        showToast('Removed from favorites', 'info');
      } else {
        response = await axios.post(`${API_BASE}/users/favorites/${id}`, {}, { headers: getAuthHeaders() });
        showToast('Added to favorites!', 'success');
      }
      const favoriteIds = response.data.map(f => f._id);
      setFavorites(favoriteIds);
    } catch (error) {
      showToast('Failed to update favorites', 'error');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to review', 'warning');
      navigate('/login');
      return;
    }
    try {
      const { data } = await axios.post(`${API_BASE}/movies/${id}/reviews`, {
        user: user.name,
        rating: reviewRating,
        comment: reviewComment
      }, { headers: getAuthHeaders() });
      setMovie(data);
      setReviewComment('');
      setReviewRating(5);
      showToast('Review submitted!', 'success');
    } catch (error) {
      console.error('Review submission error:', error.response?.data || error.message);
      showToast(error.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }} className="fade-in">
          <div style={{ width: '400px', height: '500px', borderRadius: 'var(--radius-lg)' }} className="skeleton" />
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ height: '40px', width: '300px', marginBottom: '1rem', borderRadius: 'var(--radius-md)' }} className="skeleton" />
            <div style={{ height: '20px', width: '200px', marginBottom: '1rem', borderRadius: 'var(--radius-md)' }} className="skeleton" />
            <div style={{ height: '100px', marginBottom: '1rem', borderRadius: 'var(--radius-md)' }} className="skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return <div className="container" style={{ padding: '3rem' }}>Movie not found</div>;
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    padding: '1rem 2.5rem',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
  };

  const secondaryButtonStyle = {
    background: 'transparent',
    color: 'var(--primary)',
    padding: '1rem 2rem',
    border: '2px solid var(--primary)',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1.5rem',
    marginLeft: '1rem',
    transition: 'all 0.2s ease'
  };

  const showCardStyle = {
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const reviewCardStyle = {
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    marginBottom: '1rem'
  };

  const getSelectedShowCardStyle = () => {
    return {
      ...showCardStyle,
      border: '2px solid var(--primary)',
      background: 'var(--primary-light)'
    };
  };

  const getFormContainerStyle = () => {
    return {
      marginBottom: '2rem',
      background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
      padding: '2rem',
      borderRadius: 'var(--radius-lg)',
      border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
    };
  };

  const getInputStyle = () => {
    return {
      padding: '0.7rem',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
      background: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg)',
      color: 'inherit',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    };
  };

  const getTextareaStyle = () => {
    return {
      width: '100%',
      padding: '1rem',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
      background: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg)',
      color: 'inherit',
      minHeight: '100px',
      fontSize: '1rem',
      outline: 'none',
      resize: 'vertical',
      transition: 'border-color 0.2s ease'
    };
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };

  return (
    <div style={{ padding: '4rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', marginBottom: '4rem', flexWrap: 'wrap' }} className="fade-in">
          <div>
            <img 
              src={movie.poster || 'https://picsum.photos/400/600?random=0'} 
              alt={`Poster for ${movie.title}`}
              style={{
                width: '100%',
                maxWidth: '450px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)'
              }}
              loading="lazy"
            />
          </div>
          
          <div>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '1rem', color: 'inherit' }}>
              {movie.title}
            </h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '1.1rem' }}>
                ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
              </span>
              <span style={{ color: 'inherit', fontSize: '1.1rem' }}>
                {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language} • {movie.duration} min
              </span>
            </div>
            
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
              {movie.description}
            </p>
            
            <p style={{ marginBottom: '1rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
              <strong>🎭 Cast:</strong> {Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}
            </p>
            
            <p style={{ marginBottom: '1.5rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
              <strong>📅 Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button 
                style={buttonStyle}
                onClick={toggleFavorite}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                aria-label={favorites.includes(id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.includes(id) ? '❤️ In Favorites' : '♡ Add to Favorites'}
              </button>
              
              {movie.trailer && (
                <a 
                  href={movie.trailer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={secondaryButtonStyle}
                  onMouseEnter={(e) => e.target.style.background = 'var(--primary-light)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  aria-label={`Watch trailer for ${movie.title}`}
                >
                  ▶ Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {movie.trailer && (
          <div style={{ marginBottom: '4rem' }} className="fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'inherit' }}>
              🎬 Trailer
            </h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              <iframe
                src={movie.trailer}
                title={`${movie.title} Trailer`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}

        {shows.length > 0 && (
          <div style={{ marginBottom: '4rem' }} className="fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'inherit' }}>
              🎟 Available Shows
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }} role="radiogroup" aria-label="Available shows">
              {shows.map(show => (
                <div
                  key={show._id}
                  style={selectedShow?._id === show._id ? getSelectedShowCardStyle() : showCardStyle}
                  onClick={() => setSelectedShow(show)}
                  role="radio"
                  aria-checked={selectedShow?._id === show._id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedShow(show);
                    }
                  }}
                >
                  <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    📍 {show.theater?.name || 'Cinema'}
                  </p>
                  <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    📅 {new Date(show.date).toLocaleDateString()}
                  </p>
                  <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    ⏰ {show.time}
                  </p>
                  <div style={{ marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: '700', color: '#FFD700' }}>Platinum: ₹{show.pricePlatinum || show.price * 1.5}</span>
                  </div>
                  <div style={{ marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: '700', color: '#C0C0C0' }}>Gold: ₹{show.priceGold || show.price * 1.25}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '700', color: '#A9A9A9' }}>Silver: ₹{show.priceSilver || show.price}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedShow && user && (
              <Link 
                to={`/book/${selectedShow._id}`}
                style={{
                  ...buttonStyle,
                  textDecoration: 'none',
                  display: 'inline-block',
                  padding: '1rem 2.5rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🎫 Book Tickets for This Show
              </Link>
            )}
            
            {selectedShow && !user && (
              <Link 
                to={`/login`}
                style={{
                  ...buttonStyle,
                  textDecoration: 'none',
                  display: 'inline-block',
                  padding: '1rem 2.5rem'
                }}
              >
                Please Login to Book
              </Link>
            )}
          </div>
        )}

        <div style={{ marginBottom: '4rem' }} className="fade-in">
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'inherit' }}>
            💬 Reviews & Ratings
          </h2>
          
          {user && (
            <form onSubmit={submitReview} style={getFormContainerStyle()} aria-label="Add your review">
              <h3 style={{ marginBottom: '1rem' }}>Add Your Review</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="review-rating" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rating</label>
                <select
                  id="review-rating"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  style={getInputStyle()}
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="review-comment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Comment</label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write your review..."
                  style={getTextareaStyle()}
                  required
                />
              </div>
              
              <button type="submit" style={{ ...buttonStyle, marginTop: 0 }}>Submit Review</button>
            </form>
          )}
          
          {movie.reviews && movie.reviews.length > 0 ? (
            movie.reviews.map((review, index) => (
              <div key={index} style={reviewCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{review.user || 'Anonymous'}</strong>
                  <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-md)', fontWeight: '700' }}>
                    ⭐ {review.rating}
                  </span>
                </div>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', lineHeight: '1.6' }}>{review.comment}</p>
                <p style={{ fontSize: '0.9rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {review.date ? new Date(review.date).toLocaleDateString() : ''}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>

        {similarMovies.length > 0 && (
          <div className="fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'inherit' }}>
              🎥 Similar Movies
            </h2>
            <div style={gridStyle}>
              {similarMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
