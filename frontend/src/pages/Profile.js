import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Shield, Star, Heart, Calendar, Clock, MapPin, Camera, Upload, TrendingUp, Award, Ticket, X, Sparkles, BarChart3 } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const { user, getAuthHeaders, setUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeaders() });
      setUser(prev => ({ ...prev, ...data }));
      setFavorites(data.favorites || []);
      setWatchlist(data.watchlist || []);
      setAvatarPreview(data.avatar || null);
    } catch (error) {
      console.error('Failed to load user profile');
    }
  }, [getAuthHeaders, setUser]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/movies/recommended`, { headers: getAuthHeaders() });
      setRecommendedMovies(data || []);
    } catch (error) {
      console.error('Failed to load recommendations');
    }
  }, [getAuthHeaders]);

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
    fetchRecommendations();
  }, [user, navigate, fetchBookings, fetchUserProfile, fetchRecommendations]);

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await axios.put(`${API_BASE}/users/avatar`, formData, {
        headers: getAuthHeaders()
      });
      
      setAvatarPreview(data.avatar);
      setUser(prev => ({ ...prev, avatar: data.avatar }));
      showToast('Avatar updated successfully', 'success');
    } catch (error) {
      showToast('Failed to upload avatar', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      const { data } = await axios.delete(`${API_BASE}/users/watchlist/${movieId}`, { headers: getAuthHeaders() });
      setWatchlist(data);
      showToast('Removed from watchlist', 'info');
    } catch (error) {
      showToast('Failed to remove from watchlist', 'error');
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
        <h3 style={{ color: 'inherit', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket size={20} /> Cancellation Policy
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

  const tabStyle = {
    padding: '0.8rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent'
  };

  const activeTabStyle = {
    ...tabStyle,
    borderBottom: '2px solid var(--primary)',
    color: 'var(--primary)',
    fontWeight: '700'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '4px solid var(--primary)'
            }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={60} color="white" />
              )}
            </div>
            <label htmlFor="avatar-upload" style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '3px solid white'
            }}>
              <Camera size={18} color="white" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <h1 style={{ color: 'inherit', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={28} /> My Profile
            </h1>
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
              {user?.name} • {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ 
            padding: '1.5rem',
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <Mail size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Email</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{user?.email}</p>
          </div>
          <div style={{ 
            padding: '1.5rem',
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <Shield size={24} color={user?.role === 'admin' ? 'var(--primary)' : 'var(--success)'} style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Role</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: user?.role === 'admin' ? 'var(--primary)' : 'var(--success)' }}>
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
          <div style={{ 
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.1), rgba(233, 69, 96, 0.2))',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--primary)'
          }}>
            <Star size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Loyalty Points</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
              {user?.loyaltyPoints || 0}
            </p>
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.8rem' }}>
              (100 Points = $1 Discount)
            </p>
          </div>
          <div style={{ 
            padding: '1.5rem',
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <TrendingUp size={24} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Total Bookings</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
              {bookings.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginBottom: '2rem',
        borderBottom: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
      }}>
        <button 
          onClick={() => setActiveTab('bookings')}
          style={activeTab === 'bookings' ? activeTabStyle : tabStyle}
        >
          <Ticket size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Bookings
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          style={activeTab === 'favorites' ? activeTabStyle : tabStyle}
        >
          <Heart size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Favorites
        </button>
        <button 
          onClick={() => setActiveTab('watchlist')}
          style={activeTab === 'watchlist' ? activeTabStyle : tabStyle}
        >
          <Calendar size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Watchlist
        </button>
        <button 
          onClick={() => setActiveTab('recommendations')}
          style={activeTab === 'recommendations' ? activeTabStyle : tabStyle}
        >
          <Sparkles size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Recommended
        </button>
        <button 
          onClick={() => setActiveTab('statistics')}
          style={activeTab === 'statistics' ? activeTabStyle : tabStyle}
        >
          <BarChart3 size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Statistics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'bookings' && (
        <>
          {getCancellationPolicy()}
          <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }} className="fade-in">
            Booking History
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
              <Ticket size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
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
                    <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={16} /> {booking.theater?.name}
                    </p>
                    <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={16} /> {new Date(booking.show?.date).toLocaleDateString()} • <Clock size={16} /> {booking.show?.time}
                    </p>
                    <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Star size={16} /> {booking.selectedSeats.map(s => `${String.fromCharCode(65 + s.row)}${s.seat + 1}${s.tier ? ` (${s.tier})` : ''}`).join(', ')}
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
                      color: booking.status === 'confirmed' ? 'var(--success)' : 'var(--error)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {booking.status === 'confirmed' ? <Award size={16} /> : <X size={16} />}
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
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
        </>
      )}

      {activeTab === 'favorites' && (
        <>
          <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }} className="fade-in">
            My Favorites
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
              <Heart size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
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
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      <X size={16} /> Remove from Favorites
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'watchlist' && (
        <>
          <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }} className="fade-in">
            My Watchlist
          </h2>
          {watchlist.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem', 
              color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
              background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
            }} className="fade-in">
              <Calendar size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Your watchlist is empty!</p>
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
              {watchlist.map((movie) => movie && (
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
                      onClick={() => removeFromWatchlist(movie._id)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 1rem',
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      <X size={16} /> Remove from Watchlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'recommendations' && (
        <>
          <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }} className="fade-in">
            <Sparkles size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Recommended For You
          </h2>
          {recommendedMovies.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem', 
              color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
              background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
            }} className="fade-in">
              <Sparkles size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No recommendations yet!</p>
              <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                Add movies to your favorites and watchlist to get personalized recommendations.
              </p>
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
              {recommendedMovies.map((movie) => movie && (
                <div 
                  key={movie._id} 
                  style={{ 
                    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)', 
                    borderRadius: 'var(--radius-lg)', 
                    overflow: 'hidden',
                    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
                    transition: 'transform 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                    color: 'white',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    zIndex: 10
                  }}>
                    <Sparkles size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Recommended
                  </div>
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
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                      <Star size={14} fill="currentColor" color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{movie.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'statistics' && (
        <>
          <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }} className="fade-in">
            <BarChart3 size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Your Statistics
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '2rem'
          }} className="fade-in">
            <div style={{ 
              padding: '2rem',
              background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
              textAlign: 'center'
            }}>
              <Ticket size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {bookings.length}
              </p>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Total Bookings
              </p>
            </div>
            <div style={{ 
              padding: '2rem',
              background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
              textAlign: 'center'
            }}>
              <Heart size={40} color="#e91e63" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '3rem', fontWeight: '700', color: '#e91e63', marginBottom: '0.5rem' }}>
                {favorites.length}
              </p>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Favorite Movies
              </p>
            </div>
            <div style={{ 
              padding: '2rem',
              background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
              textAlign: 'center'
            }}>
              <Calendar size={40} color="var(--info)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--info)', marginBottom: '0.5rem' }}>
                {watchlist.length}
              </p>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Watchlist Items
              </p>
            </div>
            <div style={{ 
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.1), rgba(233, 69, 96, 0.2))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary)',
              textAlign: 'center'
            }}>
              <Star size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {user?.loyaltyPoints || 0}
              </p>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Loyalty Points
              </p>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                (100 Points = $1 Discount)
              </p>
            </div>
          </div>

          <div style={{ 
            padding: '2rem',
            background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
            marginBottom: '2rem'
          }} className="fade-in">
            <h3 style={{ color: 'inherit', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} /> Spending Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Total Spent
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                  ${bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Average per Booking
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success)' }}>
                  ${bookings.length > 0 ? (bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Confirmed Bookings
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success)' }}>
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Cancelled Bookings
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--error)' }}>
                  {bookings.filter(b => b.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '2rem',
            background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
          }} className="fade-in">
            <h3 style={{ color: 'inherit', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} /> Genre Preferences
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'].map(genre => {
                const count = favorites.filter(m => 
                  (Array.isArray(m.genre) ? m.genre : [m.genre]).includes(genre)
                ).length;
                return count > 0 ? (
                  <span 
                    key={genre}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    {genre} ({count})
                  </span>
                ) : null;
              })}
              {favorites.filter(m => (Array.isArray(m.genre) ? m.genre : [m.genre]).some(g => 
                !['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'].includes(g)
              )).length > 0 && (
                <span style={{
                  padding: '0.5rem 1rem',
                  background: theme === 'dark' ? 'var(--bg-dark)' : '#f5f5f5',
                  color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  Other genres
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
