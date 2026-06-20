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
      showToast('Failed to submit review', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ width: '400px', height: '500px', borderRadius: '12px' }} className="skeleton" />
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ height: '40px', width: '300px', marginBottom: '1rem', borderRadius: '8px' }} className="skeleton" />
            <div style={{ height: '20px', width: '200px', marginBottom: '1rem', borderRadius: '8px' }} className="skeleton" />
            <div style={{ height: '100px', marginBottom: '1rem', borderRadius: '8px' }} className="skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return <div className="container" style={{ padding: '3rem' }}>Movie not found</div>;
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
    color: 'white',
    padding: '1rem 2.5rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: 'opacity 0.3s ease'
  };

  const secondaryButtonStyle = {
    background: 'transparent',
    color: '#e94560',
    padding: '1rem 2rem',
    border: '2px solid #e94560',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1.5rem',
    marginLeft: '1rem'
  };

  const showCardStyle = {
    background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
    border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0'),
    borderRadius: '12px',
    padding: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const reviewCardStyle = {
    background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
    border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0'),
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem'
  };

  const getSelectedShowCardStyle = () => {
    return {
      ...showCardStyle,
      borderColor: '#e94560',
      background: 'rgba(233, 69, 96, 0.1)'
    };
  };

  const getFormContainerStyle = () => {
    return {
      marginBottom: '2rem',
      background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0')
    };
  };

  const getInputStyle = () => {
    return {
      padding: '0.7rem',
      borderRadius: '8px',
      border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0'),
      background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
      color: theme === 'dark' ? '#f0f0f0' : '#333'
    };
  };

  const getTextareaStyle = () => {
    return {
      width: '100%',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0'),
      background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
      color: theme === 'dark' ? '#f0f0f0' : '#333',
      minHeight: '100px',
      fontSize: '1rem'
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
          <div>
            <img 
              src={movie.poster || 'https://picsum.photos/400/600?random=0'} 
              alt={movie.title}
              style={{
                width: '100%',
                maxWidth: '450px',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }}
              loading="lazy"
            />
          </div>
          
          <div>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '1rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
              {movie.title}
            </h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ background: 'linear-gradient(135deg, #e94560, #ff6b6b)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
              </span>
              <span style={{ color: '#000000', fontSize: '1.1rem' }}>
                {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language} • {movie.duration} min
              </span>
            </div>
            
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2rem', color: theme === 'dark' ? '#ddd' : '#444' }}>
              {movie.description}
            </p>
            
            <p style={{ marginBottom: '1rem', color: theme === 'dark' ? '#ccc' : '#555' }}>
              <strong>🎭 Cast:</strong> {Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}
            </p>
            
            <p style={{ marginBottom: '1.5rem', color: theme === 'dark' ? '#ccc' : '#555' }}>
              <strong>📅 Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button 
                style={buttonStyle}
                onClick={toggleFavorite}
                onMouseEnter={(e) => e.target.style.opacity = 0.9}
                onMouseLeave={(e) => e.target.style.opacity = 1}
              >
                {favorites.includes(id) ? '❤️ In Favorites' : '♡ Add to Favorites'}
              </button>
              
              {movie.trailer && (
                <a 
                  href={movie.trailer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={secondaryButtonStyle}
                >
                  ▶ Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {movie.trailer && (
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
              🎬 Trailer
            </h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px' }}>
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
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
              🎟 Available Shows
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {shows.map(show => (
                <div
                  key={show._id}
                  style={selectedShow?._id === show._id ? getSelectedShowCardStyle() : showCardStyle}
                  onClick={() => setSelectedShow(show)}
                >
                  <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    📍 {show.theater?.name || 'Cinema'}
                  </p>
                  <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.3rem' }}>
                    📅 {new Date(show.date).toLocaleDateString()}
                  </p>
                  <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.5rem' }}>
                    ⏰ {show.time}
                  </p>
                  <p style={{ fontWeight: 'bold', color: '#e94560', fontSize: '1.1rem' }}>
                    💰 ${show.price}
                  </p>
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

        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
            💬 Reviews & Ratings
          </h2>
          
          {user && (
            <form onSubmit={submitReview} style={getFormContainerStyle()}>
              <h3 style={{ marginBottom: '1rem' }}>Add Your Review</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rating</label>
                <select
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Comment</label>
                <textarea
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
                  <span style={{ background: 'linear-gradient(135deg, #e94560, #ff6b6b)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 'bold' }}>
                    ⭐ {review.rating}
                  </span>
                </div>
                <p style={{ color: theme === 'dark' ? '#ccc' : '#555', lineHeight: '1.6' }}>{review.comment}</p>
                <p style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#888' : '#888', marginTop: '0.5rem' }}>
                  {review.date ? new Date(review.date).toLocaleDateString() : ''}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: theme === 'dark' ? '#aaa' : '#666', textAlign: 'center', padding: '2rem' }}>
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>

        {similarMovies.length > 0 && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>
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
