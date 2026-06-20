import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState({
    dashboard: true,
    movies: true,
    bookings: true
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    language: '',
    duration: '',
    releaseDate: '',
    cast: '',
    trailerUrl: '',
    posterUrl: '',
    isTrending: false,
    isUpcoming: false,
    isComingSoon: false,
    isRecommended: false
  });
  const [editingMovie, setEditingMovie] = useState(null);
  const { user, getAuthHeaders } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const hasLoadedDashboard = useRef(false);
  const hasLoadedMovies = useRef(false);
  const hasLoadedBookings = useRef(false);

  const fetchTabData = useCallback(async (tab) => {
    try {
      if (tab === 'dashboard') {
        if (hasLoadedDashboard.current) return; // Already loaded
        setLoading(prev => ({ ...prev, dashboard: true }));
        const [moviesRes, , analyticsRes] = await Promise.all([
          axios.get(`${API_BASE}/movies`),
          axios.get(`${API_BASE}/theaters`),
          axios.get(`${API_BASE}/bookings/analytics`, { headers: getAuthHeaders() })
        ]);
        // moviesRes.data is { total: X, movies: [] }
        setMovies(moviesRes.data.movies || []);
        setAnalytics(analyticsRes.data);
        hasLoadedDashboard.current = true;
        setLoading(prev => ({ ...prev, dashboard: false }));
      } else if (tab === 'movies') {
        if (hasLoadedMovies.current) return; // Already loaded
        setLoading(prev => ({ ...prev, movies: true }));
        const moviesRes = await axios.get(`${API_BASE}/movies`);
        setMovies(moviesRes.data.movies || []);
        hasLoadedMovies.current = true;
        setLoading(prev => ({ ...prev, movies: false }));
      } else if (tab === 'bookings') {
        if (hasLoadedBookings.current) return; // Already loaded
        setLoading(prev => ({ ...prev, bookings: true }));
        const bookingsRes = await axios.get(`${API_BASE}/bookings`, { headers: getAuthHeaders() });
        setBookings(bookingsRes.data || []);
        hasLoadedBookings.current = true;
        setLoading(prev => ({ ...prev, bookings: false }));
      }
    } catch (error) {
      console.error('Failed to load data for tab:', tab, error);
      showToast('Failed to load data', 'error');
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, [getAuthHeaders, showToast]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchTabData(activeTab);
  }, [user, activeTab, fetchTabData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        duration: Number(formData.duration)
        // Send genre and cast as strings, let backend split them
      };
      if (editingMovie) {
        await axios.put(`${API_BASE}/movies/${editingMovie._id}`, dataToSend, { headers: getAuthHeaders() });
        showToast('Movie updated', 'success');
      } else {
        await axios.post(`${API_BASE}/movies`, dataToSend, { headers: getAuthHeaders() });
        showToast('Movie added', 'success');
      }
      resetForm();
      hasLoadedMovies.current = false; // Reset to allow reloading
      hasLoadedDashboard.current = false;
      // Refresh movies list
      const moviesRes = await axios.get(`${API_BASE}/movies`);
      setMovies(moviesRes.data.movies || []);
    } catch (error) {
      console.error('Failed to save movie:', error.response?.data || error.message);
      showToast(`Failed to save movie: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`${API_BASE}/movies/${id}`, { headers: getAuthHeaders() });
        showToast('Movie deleted', 'success');
        hasLoadedMovies.current = false; // Reset to allow reloading
        hasLoadedDashboard.current = false;
        // Refresh movies list
        const moviesRes = await axios.get(`${API_BASE}/movies`);
        setMovies(moviesRes.data.movies || []);
      } catch (error) {
        showToast('Failed to delete movie', 'error');
      }
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      language: movie.language,
      duration: String(movie.duration),
      releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast,
      trailerUrl: movie.trailer || movie.trailerUrl || '',
      posterUrl: movie.poster || movie.posterUrl || '',
      isTrending: movie.isTrending,
      isUpcoming: movie.isUpcoming,
      isComingSoon: movie.isComingSoon,
      isRecommended: movie.isRecommended
    });
    setActiveTab('movies');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      language: '',
      duration: '',
      releaseDate: '',
      cast: '',
      trailerUrl: '',
      posterUrl: '',
      isTrending: false,
      isUpcoming: false,
      isComingSoon: false,
      isRecommended: false
    });
    setEditingMovie(null);
  };

  const getTabStyle = (active) => {
    return {
      padding: '1rem 2rem',
      background: active ? '#e94560' : (theme === 'dark' ? '#1e1e3a' : '#f0f0f0'),
      color: active ? 'white' : (theme === 'dark' ? '#f0f0f0' : '#333'),
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'all 0.2s ease'
    };
  };

  const getCardStyle = () => {
    return {
      background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0'),
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };
  };

  const getInputStyle = () => {
    return {
      width: '100%',
      padding: '0.8rem',
      borderRadius: '6px',
      border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0')
    };
  };

  const getPrimaryButtonStyle = () => {
    return {
      padding: '0.8rem 1.5rem',
      background: '#e94560',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600'
    };
  };

  const getSecondaryButtonStyle = () => {
    return {
      padding: '0.8rem 1.5rem',
      background: 'transparent',
      color: theme === 'dark' ? '#f0f0f0' : '#333',
      border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0'),
      borderRadius: '6px',
      cursor: 'pointer'
    };
  };

  const getSmallPrimaryButtonStyle = () => {
    return {
      padding: '0.5rem 1rem',
      background: '#2196f3',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    };
  };

  const getSmallDangerButtonStyle = () => {
    return {
      padding: '0.5rem 1rem',
      background: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    };
  };

  const getStatusStyle = (status) => {
    return {
      padding: '0.3rem 0.8rem',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      background: status === 'confirmed' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
      color: status === 'confirmed' ? '#4caf50' : '#f44336'
    };
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ color: theme === 'dark' ? '#f0f0f0' : '#333', marginBottom: '2rem' }}>
        🎛️ Admin Dashboard
      </h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button style={getTabStyle(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </button>
        <button style={getTabStyle(activeTab === 'movies')} onClick={() => { setActiveTab('movies'); resetForm(); }}>
          Movies
        </button>
        <button style={getTabStyle(activeTab === 'bookings')} onClick={() => setActiveTab('bookings')}>
          Bookings
        </button>
      </div>

      {activeTab === 'dashboard' && (
        loading.dashboard ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</div>
        ) : analytics ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={getCardStyle()}>
                <p style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Users</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e94560' }}>{analytics.totalUsers}</p>
              </div>
              <div style={getCardStyle()}>
                <p style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Movies</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e94560' }}>{analytics.totalMovies}</p>
              </div>
              <div style={getCardStyle()}>
                <p style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Bookings</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e94560' }}>{analytics.totalBookings}</p>
              </div>
              <div style={getCardStyle()}>
                <p style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e94560' }}>${analytics.totalRevenue?.toFixed(2) || 0}</p>
              </div>
            </div>
          </div>
        ) : null
      )}

      {activeTab === 'movies' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={getCardStyle()}>
            <h2 style={{ color: theme === 'dark' ? '#f0f0f0' : '#333', marginBottom: '1.5rem' }}>
              {editingMovie ? 'Edit Movie' : 'Add New Movie'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required style={{ ...getInputStyle(), minHeight: '100px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Genre (comma-separated)</label>
                <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Language</label>
                  <input type="text" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} required style={getInputStyle()} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Duration (min)</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required style={getInputStyle()} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Release Date</label>
                <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Cast (comma-separated)</label>
                <input type="text" value={formData.cast} onChange={(e) => setFormData({ ...formData, cast: e.target.value })} style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Poster URL</label>
                <input type="text" value={formData.posterUrl} onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })} style={getInputStyle()} />
                {formData.posterUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Poster Preview</label>
                    <img 
                      src={formData.posterUrl} 
                      alt="Poster Preview"
                      style={{ width: '200px', height: '300px', objectFit: 'cover', borderRadius: '8px', border: '1px solid ' + (theme === 'dark' ? '#3a3a5a' : '#e0e0e0') }}
                      onError={(e) => { e.target.src = 'https://picsum.photos/200/300?random=preview'; }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Trailer URL</label>
                <input type="text" value={formData.trailerUrl} onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })} style={getInputStyle()} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input type="checkbox" checked={formData.isTrending} onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })} /> 🔥 Trending
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input type="checkbox" checked={formData.isUpcoming} onChange={(e) => setFormData({ ...formData, isUpcoming: e.target.checked })} /> 📅 Upcoming
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input type="checkbox" checked={formData.isComingSoon} onChange={(e) => setFormData({ ...formData, isComingSoon: e.target.checked })} /> 🎉 Coming Soon
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input type="checkbox" checked={formData.isRecommended} onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })} /> ⭐ Recommended
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={getPrimaryButtonStyle()}>
                  {editingMovie ? 'Update Movie' : 'Add Movie'}
                </button>
                {editingMovie && <button type="button" onClick={resetForm} style={getSecondaryButtonStyle()}>Cancel</button>}
              </div>
            </form>
          </div>

          <div>
            <h2 style={{ color: theme === 'dark' ? '#f0f0f0' : '#333', marginBottom: '1.5rem' }}>Manage Movies</h2>
            {loading.movies ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading movies...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {movies.map(movie => (
                  <div key={movie._id} style={{ ...getCardStyle(), padding: '0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '1rem', padding: '1.2rem' }}>
                      <img 
                        src={movie.poster || 'https://picsum.photos/400/600?random=0'} 
                        alt={movie.title}
                        style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme === 'dark' ? '#f0f0f0' : '#333' }}>{movie.title}</h3>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {movie.isTrending && <span title="Trending">🔥</span>}
                            {movie.isUpcoming && <span title="Upcoming">📅</span>}
                            {movie.isComingSoon && <span title="Coming Soon">🎉</span>}
                            {movie.isRecommended && <span title="Recommended">⭐</span>}
                          </div>
                        </div>
                        <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                          {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language}
                        </p>
                        <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                          ⭐ {movie.rating?.toFixed(1) || 'N/A'} • {movie.duration} min
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button onClick={() => handleEdit(movie)} style={getSmallPrimaryButtonStyle()}>Edit</button>
                          <button onClick={() => handleDelete(movie._id)} style={getSmallDangerButtonStyle()}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2 style={{ color: theme === 'dark' ? '#f0f0f0' : '#333', marginBottom: '1.5rem' }}>All Bookings</h2>
          {loading.bookings ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>
          ) : (
            bookings.map(booking => (
              <div key={booking._id} style={{ ...getCardStyle(), padding: '1.5rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{booking.movie?.title}</p>
                <p style={{ color: theme === 'dark' ? '#aaa' : '#666' }}>By: {booking.user?.name} ({booking.user?.email})</p>
                <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.5rem' }}>
                  📍 {booking.theater?.name} • {new Date(booking.show?.date).toLocaleDateString()} • {booking.show?.time}
                </p>
                <p style={{ color: '#e94560', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  ${booking.totalAmount?.toFixed(2) || 0} • {booking.selectedSeats?.length} seats
                </p>
                <span style={getStatusStyle(booking.status)}>
                  {booking.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
