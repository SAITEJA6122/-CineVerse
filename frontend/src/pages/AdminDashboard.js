import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Film, TrendingUp, Users, Ticket, Trash2, Edit, Flame, Calendar as CalendarIcon, Sparkles, Star } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState({
    dashboard: true,
    movies: true,
    theaters: true,
    shows: true,
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
  const [theaterFormData, setTheaterFormData] = useState({
    name: '',
    location: '',
    screens: [{ screenNumber: 1, seatLayout: { rows: 10, seatsPerRow: 10 } }]
  });
  const [showFormData, setShowFormData] = useState({
    movie: '',
    theater: '',
    screenNumber: 1,
    date: '',
    time: '',
    price: '',
    priceSilver: '',
    priceGold: '',
    pricePlatinum: ''
  });
  const [editingMovie, setEditingMovie] = useState(null);
  const [editingTheater, setEditingTheater] = useState(null);
  const [editingShow, setEditingShow] = useState(null);
  const { user, getAuthHeaders } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const hasLoadedDashboard = useRef(false);
  const hasLoadedMovies = useRef(false);
  const hasLoadedTheaters = useRef(false);
  const hasLoadedShows = useRef(false);
  const hasLoadedBookings = useRef(false);

  const fetchTabData = useCallback(async (tab) => {
    try {
      if (tab === 'dashboard') {
        if (hasLoadedDashboard.current) return;
        setLoading(prev => ({ ...prev, dashboard: true }));
        const [moviesRes, analyticsRes] = await Promise.all([
          axios.get(`${API_BASE}/movies`),
          axios.get(`${API_BASE}/bookings/analytics`, { headers: getAuthHeaders() })
        ]);
        setMovies(moviesRes.data.movies || []);
        setAnalytics(analyticsRes.data);
        hasLoadedDashboard.current = true;
        setLoading(prev => ({ ...prev, dashboard: false }));
      } else if (tab === 'movies') {
        if (hasLoadedMovies.current) return;
        setLoading(prev => ({ ...prev, movies: true }));
        const moviesRes = await axios.get(`${API_BASE}/movies`);
        setMovies(moviesRes.data.movies || []);
        hasLoadedMovies.current = true;
        setLoading(prev => ({ ...prev, movies: false }));
      } else if (tab === 'theaters') {
        if (hasLoadedTheaters.current) return;
        setLoading(prev => ({ ...prev, theaters: true }));
        const theatersRes = await axios.get(`${API_BASE}/theaters`);
        setTheaters(theatersRes.data || []);
        hasLoadedTheaters.current = true;
        setLoading(prev => ({ ...prev, theaters: false }));
      } else if (tab === 'shows') {
        setLoading(prev => ({ ...prev, shows: true }));
        const [showsRes, moviesRes, theatersRes] = await Promise.all([
          axios.get(`${API_BASE}/shows`),
          axios.get(`${API_BASE}/movies`),
          axios.get(`${API_BASE}/theaters`)
        ]);
        setShows(showsRes.data || []);
        setMovies(moviesRes.data.movies || []);
        setTheaters(theatersRes.data || []);
        hasLoadedShows.current = true;
        hasLoadedMovies.current = true;
        hasLoadedTheaters.current = true;
        setLoading(prev => ({ ...prev, shows: false }));
      } else if (tab === 'bookings') {
        if (hasLoadedBookings.current) return;
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
      };
      if (editingMovie) {
        await axios.put(`${API_BASE}/movies/${editingMovie._id}`, dataToSend, { headers: getAuthHeaders() });
        showToast('Movie updated', 'success');
      } else {
        await axios.post(`${API_BASE}/movies`, dataToSend, { headers: getAuthHeaders() });
        showToast('Movie added', 'success');
      }
      resetForm();
      hasLoadedMovies.current = false;
      hasLoadedDashboard.current = false;
      const moviesRes = await axios.get(`${API_BASE}/movies`);
      setMovies(moviesRes.data.movies || []);
    } catch (error) {
      console.error('Failed to save movie:', error.response?.data || error.message);
      showToast(`Failed to save movie: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleTheaterSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTheater) {
        await axios.put(`${API_BASE}/theaters/${editingTheater._id}`, theaterFormData, { headers: getAuthHeaders() });
        showToast('Theater updated', 'success');
      } else {
        await axios.post(`${API_BASE}/theaters`, theaterFormData, { headers: getAuthHeaders() });
        showToast('Theater added', 'success');
      }
      resetTheaterForm();
      hasLoadedTheaters.current = false;
      const theatersRes = await axios.get(`${API_BASE}/theaters`);
      setTheaters(theatersRes.data || []);
    } catch (error) {
      console.error('Failed to save theater:', error.response?.data || error.message);
      showToast(`Failed to save theater: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleShowSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShow) {
        await axios.put(`${API_BASE}/shows/${editingShow._id}`, showFormData, { headers: getAuthHeaders() });
        showToast('Show updated', 'success');
      } else {
        await axios.post(`${API_BASE}/shows`, showFormData, { headers: getAuthHeaders() });
        showToast('Show added', 'success');
      }
      resetShowForm();
      hasLoadedShows.current = false;
      const showsRes = await axios.get(`${API_BASE}/shows`);
      setShows(showsRes.data || []);
    } catch (error) {
      console.error('Failed to save show:', error.response?.data || error.message);
      showToast(`Failed to save show: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`${API_BASE}/movies/${id}`, { headers: getAuthHeaders() });
        showToast('Movie deleted', 'success');
        hasLoadedMovies.current = false;
        hasLoadedDashboard.current = false;
        const moviesRes = await axios.get(`${API_BASE}/movies`);
        setMovies(moviesRes.data.movies || []);
      } catch (error) {
        showToast('Failed to delete movie', 'error');
      }
    }
  };

  const handleDeleteTheater = async (id) => {
    if (window.confirm('Are you sure you want to delete this theater?')) {
      try {
        await axios.delete(`${API_BASE}/theaters/${id}`, { headers: getAuthHeaders() });
        showToast('Theater deleted', 'success');
        hasLoadedTheaters.current = false;
        const theatersRes = await axios.get(`${API_BASE}/theaters`);
        setTheaters(theatersRes.data || []);
      } catch (error) {
        showToast('Failed to delete theater', 'error');
      }
    }
  };

  const handleDeleteShow = async (id) => {
    if (window.confirm('Are you sure you want to delete this show?')) {
      try {
        await axios.delete(`${API_BASE}/shows/${id}`, { headers: getAuthHeaders() });
        showToast('Show deleted', 'success');
        hasLoadedShows.current = false;
        const showsRes = await axios.get(`${API_BASE}/shows`);
        setShows(showsRes.data || []);
      } catch (error) {
        showToast('Failed to delete show', 'error');
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

  const handleEditTheater = (theater) => {
    setEditingTheater(theater);
    setTheaterFormData({
      name: theater.name,
      location: theater.location,
      screens: theater.screens
    });
    setActiveTab('theaters');
  };

  const handleEditShow = (show) => {
    setEditingShow(show);
    setShowFormData({
      movie: show.movie._id,
      theater: show.theater._id,
      screenNumber: show.screenNumber,
      date: new Date(show.date).toISOString().split('T')[0],
      time: show.time,
      price: String(show.price),
      priceSilver: String(show.priceSilver || ''),
      priceGold: String(show.priceGold || ''),
      pricePlatinum: String(show.pricePlatinum || '')
    });
    setActiveTab('shows');
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

  const resetTheaterForm = () => {
    setTheaterFormData({
      name: '',
      location: '',
      screens: [{ screenNumber: 1, seatLayout: { rows: 10, seatsPerRow: 10 } }]
    });
    setEditingTheater(null);
  };

  const resetShowForm = () => {
    setShowFormData({
      movie: '',
      theater: '',
      screenNumber: 1,
      date: '',
      time: '',
      price: '',
      priceSilver: '',
      priceGold: '',
      pricePlatinum: ''
    });
    setEditingShow(null);
  };

  const getTabStyle = (active) => {
    return {
      padding: '1rem 2rem',
      background: active ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : (theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)'),
      color: active ? 'white' : 'inherit',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      boxShadow: active ? '0 4px 12px rgba(233, 69, 96, 0.3)' : 'none'
    };
  };

  const getCardStyle = () => {
    return {
      background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem',
      border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
      boxShadow: 'var(--shadow-md)'
    };
  };

  const getInputStyle = () => {
    return {
      width: '100%',
      padding: '0.8rem',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
      background: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg)',
      color: 'inherit',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    };
  };

  const getPrimaryButtonStyle = () => {
    return {
      padding: '0.8rem 1.5rem',
      background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
    };
  };

  const getSecondaryButtonStyle = () => {
    return {
      padding: '0.8rem 1.5rem',
      background: 'transparent',
      color: 'inherit',
      border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  const getSmallPrimaryButtonStyle = () => {
    return {
      padding: '0.5rem 1rem',
      background: 'var(--info)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  const getSmallDangerButtonStyle = () => {
    return {
      padding: '0.5rem 1rem',
      background: 'var(--error)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  const getStatusStyle = (status) => {
    return {
      padding: '0.3rem 0.8rem',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.9rem',
      fontWeight: '600',
      background: status === 'confirmed' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
      color: status === 'confirmed' ? 'var(--success)' : 'var(--error)'
    };
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ color: 'inherit', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Settings size={32} />
        Admin Dashboard
      </h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }} role="tablist">
          <button style={getTabStyle(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')} role="tab" aria-selected={activeTab === 'dashboard'}>
            Dashboard
          </button>
          <button style={getTabStyle(activeTab === 'movies')} onClick={() => { setActiveTab('movies'); resetForm(); }} role="tab" aria-selected={activeTab === 'movies'}>
            Movies
          </button>
          <button style={getTabStyle(activeTab === 'theaters')} onClick={() => { setActiveTab('theaters'); resetTheaterForm(); }} role="tab" aria-selected={activeTab === 'theaters'}>
            Theaters
          </button>
          <button style={getTabStyle(activeTab === 'shows')} onClick={() => { setActiveTab('shows'); resetShowForm(); }} role="tab" aria-selected={activeTab === 'shows'}>
            Shows
          </button>
          <button style={getTabStyle(activeTab === 'bookings')} onClick={() => setActiveTab('bookings')} role="tab" aria-selected={activeTab === 'bookings'}>
            Bookings
          </button>
        </div>

      {activeTab === 'dashboard' && (
        loading.dashboard ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</div>
        ) : analytics ? (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={getCardStyle()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Users size={20} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} />
                  <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Total Users</p>
                </div>
                <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>{analytics.totalUsers}</p>
              </div>
              <div style={getCardStyle()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Film size={20} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} />
                  <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Total Movies</p>
                </div>
                <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>{analytics.totalMovies}</p>
              </div>
              <div style={getCardStyle()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Ticket size={20} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} />
                  <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Total Bookings</p>
                </div>
                <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>{analytics.totalBookings}</p>
              </div>
              <div style={getCardStyle()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <TrendingUp size={20} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} />
                  <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Total Revenue</p>
                </div>
                <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>${analytics.totalRevenue?.toFixed(2) || 0}</p>
              </div>
            </div>
          </div>
        ) : null
      )}

      {activeTab === 'movies' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="fade-in">
          <div style={getCardStyle()}>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }}>
              {editingMovie ? 'Edit Movie' : 'Add New Movie'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="movie-title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title</label>
                <input id="movie-title" type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="movie-description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                <textarea id="movie-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required style={{ ...getInputStyle(), minHeight: '100px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="movie-genre" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Genre (comma-separated)</label>
                <input id="movie-genre" type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="movie-language" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Language</label>
                  <input id="movie-language" type="text" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} required style={getInputStyle()} />
                </div>
                <div>
                  <label htmlFor="movie-duration" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Duration (min)</label>
                  <input id="movie-duration" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required style={getInputStyle()} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="movie-release-date" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Release Date</label>
                <input id="movie-release-date" type="date" value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="movie-cast" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Cast (comma-separated)</label>
                <input id="movie-cast" type="text" value={formData.cast} onChange={(e) => setFormData({ ...formData, cast: e.target.value })} style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="movie-poster" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Poster URL</label>
                <input id="movie-poster" type="text" value={formData.posterUrl} onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })} style={getInputStyle()} />
                {formData.posterUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Poster Preview</label>
                    <img 
                      src={formData.posterUrl} 
                      alt="Poster Preview"
                      style={{ width: '200px', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}` }}
                      onError={(e) => { e.target.src = 'https://picsum.photos/200/300?random=preview'; }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="movie-trailer" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Trailer URL</label>
                <input id="movie-trailer" type="text" value={formData.trailerUrl} onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })} style={getInputStyle()} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                <label htmlFor="movie-trending" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input id="movie-trending" type="checkbox" checked={formData.isTrending} onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })} /> <Flame size={16} /> Trending
                </label>
                <label htmlFor="movie-upcoming" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input id="movie-upcoming" type="checkbox" checked={formData.isUpcoming} onChange={(e) => setFormData({ ...formData, isUpcoming: e.target.checked })} /> <CalendarIcon size={16} /> Upcoming
                </label>
                <label htmlFor="movie-coming-soon" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input id="movie-coming-soon" type="checkbox" checked={formData.isComingSoon} onChange={(e) => setFormData({ ...formData, isComingSoon: e.target.checked })} /> <Sparkles size={16} /> Coming Soon
                </label>
                <label htmlFor="movie-recommended" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                  <input id="movie-recommended" type="checkbox" checked={formData.isRecommended} onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })} /> <Star size={16} /> Recommended
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
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }}>Manage Movies</h2>
            {loading.movies ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading movies...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {movies.map(movie => (
                  <div key={movie._id} style={{ ...getCardStyle(), padding: '0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '1rem', padding: '1.2rem' }}>
                      <img 
                        src={movie.poster || 'https://picsum.photos/400/600?random=0'} 
                        alt={`Poster for ${movie.title}`}
                        style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                        loading="lazy"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'inherit' }}>{movie.title}</h3>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {movie.isTrending && <Flame size={16} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} title="Trending" />}
                            {movie.isUpcoming && <CalendarIcon size={16} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} title="Upcoming" />}
                            {movie.isComingSoon && <Sparkles size={16} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} title="Coming Soon" />}
                            {movie.isRecommended && <Star size={16} color={theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'} title="Recommended" />}
                          </div>
                        </div>
                        <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                          {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language}
                        </p>
                        <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={14} fill={movie.rating ? 'currentColor' : 'none'} /> {movie.rating?.toFixed(1) || 'N/A'} • {movie.duration} min
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button onClick={() => handleEdit(movie)} style={getSmallPrimaryButtonStyle()}><Edit size={14} style={{ marginRight: '0.25rem' }} /> Edit</button>
                          <button onClick={() => handleDelete(movie._id)} style={getSmallDangerButtonStyle()}><Trash2 size={14} style={{ marginRight: '0.25rem' }} /> Delete</button>
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

      {activeTab === 'theaters' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="fade-in">
          <div style={getCardStyle()}>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }}>
              {editingTheater ? 'Edit Theater' : 'Add New Theater'}
            </h2>
            <form onSubmit={handleTheaterSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="theater-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Theater Name</label>
                <input id="theater-name" type="text" value={theaterFormData.name} onChange={(e) => setTheaterFormData({ ...theaterFormData, name: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="theater-location" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Location</label>
                <input id="theater-location" type="text" value={theaterFormData.location} onChange={(e) => setTheaterFormData({ ...theaterFormData, location: e.target.value })} required style={getInputStyle()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="theater-screens" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Screens (JSON)</label>
                <textarea 
                  id="theater-screens"
                  value={JSON.stringify(theaterFormData.screens, null, 2)} 
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setTheaterFormData({ ...theaterFormData, screens: parsed });
                    } catch (err) {
                      // Ignore invalid JSON while typing
                    }
                  }} 
                  style={{ ...getInputStyle(), minHeight: '150px', fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={getPrimaryButtonStyle()}>
                  {editingTheater ? 'Update Theater' : 'Add Theater'}
                </button>
                {editingTheater && <button type="button" onClick={resetTheaterForm} style={getSecondaryButtonStyle()}>Cancel</button>}
              </div>
            </form>
          </div>
          <div>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }}>Manage Theaters</h2>
            {loading.theaters ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading theaters...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {theaters.map(theater => (
                  <div key={theater._id} style={{ ...getCardStyle(), padding: '1.2rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', color: 'inherit' }}>{theater.name}</h3>
                    <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>{theater.location}</p>
                    <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                      Screens: {theater.screens?.length || 0}
                    </p>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button onClick={() => handleEditTheater(theater)} style={getSmallPrimaryButtonStyle()}>Edit</button>
                      <button onClick={() => handleDeleteTheater(theater._id)} style={getSmallDangerButtonStyle()}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'shows' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="fade-in">
          <div style={getCardStyle()}>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }}>
              {editingShow ? 'Edit Show' : 'Add New Show'}
            </h2>
            <form onSubmit={handleShowSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="show-movie" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Movie</label>
                <select 
                  id="show-movie"
                  value={showFormData.movie} 
                  onChange={(e) => setShowFormData({ ...showFormData, movie: e.target.value })} 
                  required 
                  style={getInputStyle()}
                >
                  <option value="">Select Movie</option>
                  {movies.map(movie => (
                    <option key={movie._id} value={movie._id}>{movie.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="show-theater" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Theater</label>
                <select 
                  id="show-theater"
                  value={showFormData.theater} 
                  onChange={(e) => {
                    const theater = theaters.find(t => t._id === e.target.value);
                    setShowFormData({ 
                      ...showFormData, 
                      theater: e.target.value, 
                      screenNumber: theater?.screens?.[0]?.screenNumber || 1 
                    });
                  }} 
                  required 
                  style={getInputStyle()}
                >
                  <option value="">Select Theater</option>
                  {theaters.map(theater => (
                    <option key={theater._id} value={theater._id}>{theater.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="show-screen" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Screen Number</label>
                  <input 
                    id="show-screen"
                    type="number" 
                    value={showFormData.screenNumber} 
                    onChange={(e) => setShowFormData({ ...showFormData, screenNumber: Number(e.target.value) })} 
                    required 
                    style={getInputStyle()} 
                  />
                </div>
                <div>
                  <label htmlFor="show-price" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Base Price (Legacy)</label>
                  <input 
                    id="show-price"
                    type="number" 
                    value={showFormData.price} 
                    onChange={(e) => setShowFormData({ ...showFormData, price: e.target.value })} 
                    required 
                    style={getInputStyle()} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tiered Pricing</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor="show-price-silver" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Silver</label>
                    <input 
                      id="show-price-silver"
                      type="number" 
                      value={showFormData.priceSilver} 
                      onChange={(e) => setShowFormData({ ...showFormData, priceSilver: e.target.value })} 
                      required 
                      style={getInputStyle()} 
                      placeholder="Silver price"
                    />
                  </div>
                  <div>
                    <label htmlFor="show-price-gold" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Gold</label>
                    <input 
                      id="show-price-gold"
                      type="number" 
                      value={showFormData.priceGold} 
                      onChange={(e) => setShowFormData({ ...showFormData, priceGold: e.target.value })} 
                      required 
                      style={getInputStyle()} 
                      placeholder="Gold price"
                    />
                  </div>
                  <div>
                    <label htmlFor="show-price-platinum" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Platinum</label>
                    <input 
                      id="show-price-platinum"
                      type="number" 
                      value={showFormData.pricePlatinum} 
                      onChange={(e) => setShowFormData({ ...showFormData, pricePlatinum: e.target.value })} 
                      required 
                      style={getInputStyle()} 
                      placeholder="Platinum price"
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="show-date" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date</label>
                  <input id="show-date" type="date" value={showFormData.date} onChange={(e) => setShowFormData({ ...showFormData, date: e.target.value })} required style={getInputStyle()} />
                </div>
                <div>
                  <label htmlFor="show-time" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Time</label>
                  <input id="show-time" type="text" value={showFormData.time} onChange={(e) => setShowFormData({ ...showFormData, time: e.target.value })} required style={getInputStyle()} placeholder="e.g. 7:00 PM" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={getPrimaryButtonStyle()}>
                  {editingShow ? 'Update Show' : 'Add Show'}
                </button>
                {editingShow && <button type="button" onClick={resetShowForm} style={getSecondaryButtonStyle()}>Cancel</button>}
              </div>
            </form>
          </div>
          <div>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }}>Manage Shows</h2>
            {loading.shows ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading shows...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {shows.map(show => (
                  <div key={show._id} style={{ ...getCardStyle(), padding: '1.2rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', color: 'inherit' }}>{show.movie?.title}</h3>
                    <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>{show.theater?.name} • Screen {show.screenNumber}</p>
                    <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem' }}>{new Date(show.date).toLocaleDateString()} • {show.time}</p>
                    <div style={{ marginBottom: '0.8rem' }}>
                      {show.priceSilver || show.priceGold || show.pricePlatinum ? (
                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                          <span style={{ color: '#9e9e9e', fontWeight: '600', fontSize: '0.9rem' }}>Silver: ${show.priceSilver}</span>
                          <span style={{ color: '#ffd700', fontWeight: '600', fontSize: '0.9rem' }}>Gold: ${show.priceGold}</span>
                          <span style={{ color: '#e5e4e2', fontWeight: '600', fontSize: '0.9rem' }}>Platinum: ${show.pricePlatinum}</span>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--primary)', fontWeight: '700' }}>Price: ${show.price}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button onClick={() => handleEditShow(show)} style={getSmallPrimaryButtonStyle()}>Edit</button>
                      <button onClick={() => handleDeleteShow(show._id)} style={getSmallDangerButtonStyle()}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="fade-in">
          <h2 style={{ color: 'inherit', marginBottom: '1.5rem' }}>All Bookings</h2>
          {loading.bookings ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>
          ) : (
            bookings.map(booking => (
              <div key={booking._id} style={{ ...getCardStyle(), padding: '1.5rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{booking.movie?.title}</p>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>By: {booking.user?.name} ({booking.user?.email})</p>
                <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  📍 {booking.theater?.name} • {new Date(booking.show?.date).toLocaleDateString()} • {booking.show?.time}
                </p>
                <p style={{ color: 'var(--primary)', fontWeight: '700', marginBottom: '0.5rem' }}>
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
