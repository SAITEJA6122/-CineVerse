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
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    borderRadius: 'var(--radius-xl)',
    padding: '3rem',
    boxShadow: 'var(--shadow-lg)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
  };

  return (
    <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ color: 'inherit', marginBottom: '2rem' }} className="fade-in">
        Booking Confirmed!
      </h1>

      {booking && (
        <div style={ticketStyle} className="fade-in">
          <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', fontSize: '2rem', fontWeight: '700' }}>
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
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Theater</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{booking.theater?.name}</p>
            </div>
            <div>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Date</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {booking.show ? new Date(booking.show.date).toLocaleDateString() : ''}
              </p>
            </div>
            <div>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Time</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{booking.show?.time}</p>
            </div>
            <div>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Seats</p>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {booking.selectedSeats.map(s => `${String.fromCharCode(65 + s.row)}${s.seat + 1}`).join(', ')}
              </p>
            </div>
          </div>

          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', 
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem'
          }}>
            <p style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Total Amount</p>
            <p style={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}>
              ${booking.totalAmount.toFixed(2)}
            </p>
          </div>

          <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Booking ID
          </p>
          <p style={{ 
            fontFamily: 'monospace', 
            fontSize: '1.1rem', 
            background: theme === 'dark' ? 'var(--bg-dark)' : '#f5f5f5', 
            padding: '0.8rem', 
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
          }}>
            {booking._id}
          </p>

          <p style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '2rem' }}>
            Status: {booking.status === 'confirmed' ? '✅ Confirmed' : 'Cancelled'}
          </p>
        </div>
      )}

      <Link 
        to="/" 
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          color: 'white',
          padding: '1rem 3rem',
          textDecoration: 'none',
          borderRadius: 'var(--radius-lg)',
          fontSize: '1.1rem',
          fontWeight: '700',
          display: 'inline-block',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default BookingConfirmation;
