import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const SeatSelection = () => {
  const { showId } = useParams();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const { user, getAuthHeaders } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const fetchShow = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/shows/${showId}`);
      setShow(data);
    } catch (error) {
      showToast('Failed to load show details', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [showId, showToast, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchShow();
  }, [user, navigate, fetchShow]);

  const getSeatTier = (rowIndex) => {
    if (!show || !show.seatTiers) return 'Silver';
    return show.seatTiers[rowIndex] || 'Silver';
  };

  const getSeatPrice = (rowIndex) => {
    const tier = getSeatTier(rowIndex);
    if (!show) return 0;
    if (tier === 'Platinum') return show.pricePlatinum || show.price * 1.5;
    if (tier === 'Gold') return show.priceGold || show.price * 1.25;
    return show.priceSilver || show.price;
  };

  const toggleSeat = (rowIndex, seatIndex) => {
    const price = getSeatPrice(rowIndex);
    const tier = getSeatTier(rowIndex);
    setSelectedSeats(prev => {
      const exists = prev.some(s => s.row === rowIndex && s.seat === seatIndex);
      if (exists) {
        return prev.filter(s => !(s.row === rowIndex && s.seat === seatIndex));
      } else {
        return [...prev, { row: rowIndex, seat: seatIndex, price, tier }];
      }
    });
  };

  const bookSeats = async () => {
    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat', 'warning');
      return;
    }

    setBooking(true);
    try {
      const { data } = await axios.post(`${API_BASE}/bookings`, {
        show: showId,
        selectedSeats
      }, { headers: getAuthHeaders() });
      
      showToast('🎟 Booking confirmed!', 'success');
      navigate(`/confirmation/${data._id}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Booking failed', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  if (!show) {
    return <div className="container" style={{ padding: '3rem' }}>Show not found</div>;
  }

  const getSeatStyle = (available, selected, rowIndex) => {
    const tier = getSeatTier(rowIndex);
    let style = {
      width: '40px',
      height: '40px',
      margin: '6px',
      borderRadius: '6px 6px 10px 10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    };

    if (selected) {
      style.background = 'var(--primary)';
      style.color = 'white';
      style.transform = 'scale(1.1)';
      style.boxShadow = 'var(--shadow-md)';
    } else if (!available) {
      style.background = theme === 'dark' ? 'var(--border-dark)' : '#ddd';
      style.color = theme === 'dark' ? '#666' : '#888';
      style.cursor = 'not-allowed';
    } else {
      if (tier === 'Platinum') {
        style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        style.color = 'white';
        style.boxShadow = '0 2px 8px rgba(255, 165, 0, 0.3)';
      } else if (tier === 'Gold') {
        style.background = 'linear-gradient(135deg, #C0C0C0, #A9A9A9)';
        style.color = 'white';
        style.boxShadow = '0 2px 8px rgba(192, 192, 192, 0.3)';
      } else {
        style.background = theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)';
        style.color = 'inherit';
        style.border = `2px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`;
      }
    }

    return style;
  };

  const screenStyle = {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
    marginBottom: '3rem',
    borderRadius: '8px 8px 50px 50px',
    boxShadow: 'var(--shadow-md)',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontWeight: '600'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    padding: '1.2rem 3rem',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '2rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="fade-in">
        <h1 style={{ color: 'inherit', marginBottom: '0.5rem' }}>
          🎬 {show.movie?.title}
        </h1>
        <p style={{ fontSize: '1.1rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
          📍 {show.theater?.name} • 📅 {new Date(show.date).toLocaleDateString()} • ⏰ {show.time}
        </p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={screenStyle}>
          📽️ Screen This Side
        </div>

        <div style={{ marginBottom: '3rem' }}>
          {show.availableSeats && show.availableSeats.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', alignItems: 'center' }}>
              <span style={{ 
                width: '60px', 
                textAlign: 'right', 
                fontWeight: 'bold', 
                lineHeight: '40px',
                color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
                marginRight: '0.5rem'
              }}>
                {String.fromCharCode(65 + rowIndex)}
              </span>
              {row.map((seat, seatIndex) => (
                <div
                  key={seatIndex}
                  style={getSeatStyle(seat, selectedSeats.some(s => s.row === rowIndex && s.seat === seatIndex), rowIndex)}
                  onClick={() => seat && toggleSeat(rowIndex, seatIndex)}
                  title={`${getSeatTier(rowIndex)} - $${getSeatPrice(rowIndex)}`}
                >
                  {seatIndex + 1}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              ...getSeatStyle(true, false, 2), 
              width: '35px', 
              height: '35px',
              cursor: 'default' 
            }} />
            <span style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>Platinum</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              ...getSeatStyle(true, false, 1), 
              width: '35px', 
              height: '35px',
              cursor: 'default' 
            }} />
            <span style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>Gold</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              ...getSeatStyle(true, false, 0), 
              width: '35px', 
              height: '35px',
              cursor: 'default' 
            }} />
            <span style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>Silver</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              ...getSeatStyle(false, true, 0), 
              width: '35px', 
              height: '35px',
              cursor: 'default',
              transform: 'none'
            }} />
            <span style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>Selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              ...getSeatStyle(false, false, 0), 
              width: '35px', 
              height: '35px',
              cursor: 'default'
            }} />
            <span style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>Booked</span>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)', 
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
          }} className="fade-in">
            <h3 style={{ marginBottom: '0.8rem', color: 'inherit' }}>
              Selected Seats: {selectedSeats.map(s => `${String.fromCharCode(65 + s.row)}${s.seat + 1} (${s.tier})`).join(', ')}
            </h3>
            <h2 style={{ 
              color: 'var(--primary)', 
              fontSize: '2rem',
              marginBottom: '1rem',
              fontWeight: '700'
            }}>
              Total: ${totalAmount.toFixed(2)}
            </h2>
            <button
              onClick={bookSeats}
              disabled={booking}
              style={{
                ...buttonStyle,
                opacity: booking ? 0.6 : 1,
                cursor: booking ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !booking && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;
