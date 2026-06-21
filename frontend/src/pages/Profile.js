import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { user, getAuthHeaders, setUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeaders() });
      setUser(prev => ({ ...prev, ...data }));
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Failed to load user profile');
    }
  }, [getAuthHeaders, setUser]);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/bookings/mybookings`, { headers: getAuthHeaders() });
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
    fetchUserProfile();
  }, [user, navigate, fetchBookings, fetchUserProfile]);

  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const { data } = await axios.put(`${API_BASE}/bookings/${bookingId}/cancel`, {}, { headers: getAuthHeaders() });
        showToast('Booking cancelled', 'info');
        if (data.cancellationPolicy) {
          showToast(`${data.cancellationPolicy.message} - Refund: $${data.refundAmount?.toFixed(2) || 0}`, 'info');
        }
        fetchBookings();
        fetchUserProfile();
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to cancel booking', 'error');
      }
    }
  };

  const removeFromFavorites = async (movieId) => {
    if (window.confirm('Remove this movie from favorites?')) {
      try {
        const { data } = await axios.delete(`${API_BASE}/users/favorites/${movieId}`, { headers: getAuthHeaders() });
        setFavorites(data);
        showToast('Removed from favorites', 'info');
      } catch (error) {
        showToast('Failed to remove from favorites', 'error');
      }
    }
  };

  const getCancellationPolicy = () => {
    return (
      <div style={{ 
        background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)', 
        padding: '1.5rem', 
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem',
        border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
      }} className="fade-in">
        <h3 style={{ color: 'inherit', marginBottom: '1rem' }}>
          📜 Cancellation Policy
        </h3>
        <ul style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>More than 48 hours before show: 10% cancellation fee</li>
          <li style={{ marginBottom: '0.5rem' }}>24-48 hours before show: 30% cancellation fee</li>
          <li style={{ marginBottom: '0.5rem' }}>6-24 hours before show: 50% cancellation fee</li>
          <li>Less than 6 hours before show: No cancellation allowed</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ 
        background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)', 
        padding: '2.5rem', 
        borderRadius: 'var(--radius-lg)', 
        marginBottom: '3rem',
        border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
      }} className="fade-in">
        <h1 style={{ color: 'inherit', marginBottom: '1.5rem' }}>
          👤 My Profile
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>Name</p>
            <p style={{ fontSize: '1.3rem', fontWeight: '600' }}>{user?.name}</p>
          </div>
          <div>
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>Email</p>
            <p style={{ fontSize: '1.3rem', fontWeight: '600' }}>{user?.email}</p>
          </div>
          <div>
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>Role</p>
            <p style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600',
              color: user?.role === 'admin' ? 'var(--primary)' : 'inherit'
            }}>
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
          <div>
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>Loyalty Points</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
              ⭐ {user?.loyaltyPoints || 0} Points
            </p>
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
              (100 Points = $1 Discount)
            </p>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }} className="fade-in">
        ❤️ My Favorites
      </h2>
      {favorites.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem', 
          color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
          background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
        }} className="fade-in">
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No favorites yet!</p>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '600' }}>
            Browse movies →
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '2rem', 
          marginBottom: '4rem'
        }} className="fade-in">
          {favorites.map((movie) => movie && (
            <div 
              key={movie._id} 
              style={{ 
                background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden',
                border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Link to={`/movie/${movie._id}`} style={{ textDecoration: 'none' }} aria-label={`View details for ${movie.title}`}>
                <img 
                  src={movie.poster || 'https://picsum.photos/400/600?random=0'} 
                  alt={`Poster for ${movie.title}`}
                  style={{ width: '100%', height: '320px', objectFit: 'cover' }}
                  loading="lazy"
                />
              </Link>
              <div style={{ padding: '1.2rem' }}>
                <h3 style={{ 
                  color: 'inherit', 
                  marginBottom: '0.5rem',
                  fontSize: '1.1rem'
                }}>
                  {movie.title}
                </h3>
                <p style={{ 
                  color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', 
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}>
                  {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language}
                </p>
                <button 
                  onClick={() => removeFromFavorites(movie._id)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: 'var(--error)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {getCancellationPolicy()}

      <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }} className="fade-in">
        🎟 Booking History
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : bookings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem', 
          color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
          background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
        }} className="fade-in">
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No bookings yet!</p>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '600' }}>
            Browse movies →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {bookings.map(booking => (
            <div 
              key={booking._id} 
              style={{ 
                background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)', 
                padding: '1.5rem', 
                borderRadius: 'var(--radius-md)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.5rem',
                border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
              }}
              className="fade-in"
            >
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ 
                  color: 'inherit', 
                  marginBottom: '0.8rem',
                  fontSize: '1.3rem'
                }}>
                  {booking.movie?.title}
                </h3>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  📍 {booking.theater?.name}
                </p>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  📅 {new Date(booking.show?.date).toLocaleDateString()} • ⏰ {booking.show?.time}
                </p>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  🪑 {booking.selectedSeats.map(s => `${String.fromCharCode(65 + s.row)}${s.seat + 1}${s.tier ? ` (${s.tier})` : ''}`).join(', ')}
                </p>
                <p style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '700', 
                  color: 'var(--primary)', 
                  marginTop: '0.8rem'
                }}>
                  ${booking.totalAmount?.toFixed(2) || 0}
                </p>
                {booking.cancellationFee !== undefined && (
                  <p style={{ 
                    color: 'var(--warning)', 
                    fontSize: '1rem', 
                    marginTop: '0.5rem'
                  }}>
                    Cancellation Fee: ${booking.cancellationFee?.toFixed(2) || 0} • Refund: ${booking.refundAmount?.toFixed(2) || 0}
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end' }}>
                <span style={{ 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: 'var(--radius-md)', 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  background: booking.status === 'confirmed' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  color: booking.status === 'confirmed' ? 'var(--success)' : 'var(--error)'
                }}>
                  {booking.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                </span>
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => cancelBooking(booking._id)}
                    style={{
                      background: 'var(--error)',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem 1.2rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
