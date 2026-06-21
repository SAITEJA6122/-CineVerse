import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);

  const fetchBooking = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/bookings/${bookingId}`, { headers: getAuthHeaders() });
      setBooking(data);
    } catch (error) {
      console.error('Failed to load booking');
      showToast('Booking not found', 'error');
    } finally {
      setLoading(false);
    }
  }, [bookingId, getAuthHeaders, showToast]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  const ticketStyle = {
    maxWidth: '600px',
    margin: '3rem auto',
    background: theme === 'dark' ? '#1e1e3a' : 'white',
    borderRadius: '20px',
    padding: '3rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    border: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`
  };

  return (
    <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ color: theme === 'dark' ? '#f0f0f0' : '#333', marginBottom: '2rem' }}>
        Booking Confirmed!
      </h1>

      {booking && (
        <div style={ticketStyle}>
          <h2 style={{ color: '#e94560', marginBottom: '2rem', fontSize: '2rem' }}>
            🎬 {booking.movie?.title}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1.5rem', 
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <div>
              <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Theater</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{booking.theater?.name}</p>
            </div>
            <div>
              <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Date</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {booking.show ? new Date(booking.show.date).toLocaleDateString() : ''}
              </p>
            </div>
            <div>
              <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Time</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{booking.show?.time}</p>
            </div>
            <div>
              <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Seats</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {booking.selectedSeats.map(s => `${String.fromCharCode(65 + s.row)}${s.seat + 1}`).join(', ')}
              </p>
            </div>
          </div>

          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #e94560, #ff6b6b)', 
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <p style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Total Amount</p>
            <p style={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>
              ₹{booking.totalAmount}
            </p>
          </div>

          <p style={{ color: theme === 'dark' ? '#aaa' : '#666', marginBottom: '0.5rem' }}>
            Booking ID
          </p>
          <p style={{ 
            fontFamily: 'monospace', 
            fontSize: '1.1rem', 
            background: theme === 'dark' ? '#1a1a2e' : '#f5f5f5', 
            padding: '0.8rem', 
            borderRadius: '8px',
            marginBottom: '2rem',
            border: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`
          }}>
            {booking._id}
          </p>

          <p style={{ color: '#4caf50', fontWeight: '600', marginBottom: '2rem' }}>
            Status: {booking.status === 'confirmed' ? '✅ Confirmed' : 'Cancelled'}
          </p>
        </div>
      )}

      <Link 
        to="/" 
        style={{
          background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
          color: 'white',
          padding: '1rem 3rem',
          textDecoration: 'none',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          display: 'inline-block',
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default BookingConfirmation;
