import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, ArrowRight, ArrowLeft, Gift, Lock, Ticket, Star } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import ToastContext from '../context/ToastContext';
import API_BASE from '../config';

const Checkout = () => {
  const { showId } = useParams();
  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const { user, getAuthHeaders } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedSeatsData = sessionStorage.getItem('selectedSeats');
    const showData = sessionStorage.getItem('showData');
    
    if (selectedSeatsData) {
      setSelectedSeats(JSON.parse(selectedSeatsData));
    }
    if (showData) {
      setShow(JSON.parse(showData));
    }
    setLoading(false);
  }, [showId]);

  const applyPromoCode = () => {
    const promoCodes = {
      'SAVE10': 10,
      'CINE20': 20,
      'WELCOME': 15
    };
    
    if (promoCodes[promoCode.toUpperCase()]) {
      setDiscount(promoCodes[promoCode.toUpperCase()]);
      showToast(`Promo code applied! ${promoCodes[promoCode.toUpperCase()]}% off`, 'success');
    } else {
      showToast('Invalid promo code', 'error');
      setDiscount(0);
    }
  };

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const steps = [
    { id: 1, title: 'Review', icon: Ticket },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Confirm', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const { data } = await axios.post(`${API_BASE}/bookings`, {
        show: showId,
        selectedSeats,
        paymentMethod,
        promoCode: promoCode.toUpperCase(),
        discount
      }, { headers: getAuthHeaders() });
      
      sessionStorage.removeItem('selectedSeats');
      sessionStorage.removeItem('showData');
      showToast('Booking confirmed!', 'success');
      navigate(`/confirmation/${data._id}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Payment failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getProgressStyle = () => ({
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '3rem',
    padding: '1.5rem',
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
  });

  const getStepStyle = (stepId) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    opacity: stepId === step ? 1 : stepId < step ? 1 : 0.5,
    transition: 'all 0.3s ease'
  });

  const getStepCircleStyle = (stepId) => ({
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: stepId === step 
      ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))'
      : stepId < step 
        ? 'var(--success)'
        : theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg)',
    color: stepId <= step ? 'white' : 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: '700',
    boxShadow: stepId === step ? '0 4px 12px rgba(233, 69, 96, 0.3)' : 'none',
    transition: 'all 0.3s ease'
  });

  const getCardStyle = () => ({
    maxWidth: '700px',
    margin: '0 auto',
    padding: '2.5rem',
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    borderRadius: 'var(--radius-xl)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
    boxShadow: 'var(--shadow-lg)'
  });

  const getInputStyle = () => ({
    width: '100%',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
    background: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg)',
    color: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  });

  const getButtonStyle = (variant = 'primary') => ({
    padding: '1rem 2rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  });

  const getPaymentOptionStyle = (method) => ({
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${paymentMethod === method ? 'var(--primary)' : theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
    background: paymentMethod === method 
      ? 'var(--primary-light)'
      : theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  });

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  if (!show || selectedSeats.length === 0) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p>No booking data found. Please select seats first.</p>
        <button 
          onClick={() => navigate('/')}
          style={{ ...getButtonStyle(), margin: '1rem auto' }}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ color: 'inherit', marginBottom: '2rem', textAlign: 'center', fontSize: '2.5rem', fontWeight: '700' }}>
        Checkout
      </h1>

      <div style={getProgressStyle()}>
        {steps.map((s) => (
          <div key={s.id} style={getStepStyle(s.id)}>
            <div style={getStepCircleStyle(s.id)}>
              {s.id < step ? <CheckCircle size={24} /> : s.id}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{s.title}</span>
          </div>
        ))}
      </div>

      <div style={getCardStyle()} className="fade-in">
        {step === 1 && (
          <div>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={24} /> Review Your Booking
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{show.movie?.title}</h3>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
                {show.theater?.name} • {new Date(show.date).toLocaleDateString()} • {show.time}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'inherit', marginBottom: '0.8rem' }}>Selected Seats</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedSeats.map((seat, index) => (
                  <span 
                    key={index}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    {String.fromCharCode(65 + seat.row)}{seat.seat + 1} ({seat.tier})
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'inherit', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gift size={18} /> Promo Code
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  style={{ ...getInputStyle(), flex: 1 }}
                />
                <button 
                  onClick={applyPromoCode}
                  style={{ ...getButtonStyle(), background: 'var(--info)', color: 'white' }}
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p style={{ color: 'var(--success)', marginTop: '0.5rem', fontWeight: '600' }}>
                  ✓ {discount}% discount applied!
                </p>
              )}
            </div>

            <div style={{ 
              padding: '1.5rem', 
              background: theme === 'dark' ? 'var(--bg-dark)' : '#f5f5f5', 
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--success)' }}>
                  <span>Discount ({discount}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '1rem', 
                paddingTop: '1rem',
                borderTop: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
                fontSize: '1.3rem',
                fontWeight: '700'
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleNext}
                style={{ ...getButtonStyle(), background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }}
              >
                Continue to Payment <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={24} /> Payment Method
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <div 
                onClick={() => setPaymentMethod('card')}
                style={getPaymentOptionStyle('card')}
              >
                <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--primary)' : 'inherit'} />
                <div>
                  <p style={{ fontWeight: '600', margin: 0 }}>Credit/Debit Card</p>
                  <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', margin: 0 }}>
                    Visa, Mastercard, Amex
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod('upi')}
                style={{ ...getPaymentOptionStyle('upi'), marginTop: '1rem' }}
              >
                <Smartphone size={24} color={paymentMethod === 'upi' ? 'var(--primary)' : 'inherit'} />
                <div>
                  <p style={{ fontWeight: '600', margin: 0 }}>UPI Payment</p>
                  <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', margin: 0 }}>
                    Google Pay, PhonePe, Paytm
                  </p>
                </div>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    style={getInputStyle()}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Expiry</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      style={getInputStyle()}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>CVV</label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      placeholder="123"
                      style={getInputStyle()}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Name on Card</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="John Doe"
                    style={getInputStyle()}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                background: theme === 'dark' ? 'var(--bg-dark)' : '#f5f5f5',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}>
                <Smartphone size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <p style={{ marginBottom: '1rem' }}>Enter your UPI ID</p>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  style={getInputStyle()}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
              <button 
                onClick={handleBack}
                style={{ ...getButtonStyle(), background: 'transparent', border: `2px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}` }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={handleNext}
                style={{ ...getButtonStyle(), background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }}
              >
                Review Order <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ color: 'inherit', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={24} /> Confirm Booking
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{show.movie?.title}</h3>
              <p style={{ color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
                {show.theater?.name} • {new Date(show.date).toLocaleDateString()} • {show.time}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'inherit', marginBottom: '0.8rem' }}>Seats</h4>
              <p>{selectedSeats.map(s => `${String.fromCharCode(65 + s.row)}${s.seat + 1}`).join(', ')}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'inherit', marginBottom: '0.8rem' }}>Payment Method</h4>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {paymentMethod === 'card' ? <CreditCard size={18} /> : <Smartphone size={18} />}
                {paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI'}
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', 
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              <p style={{ marginBottom: '0.5rem' }}>Total Amount</p>
              <p style={{ fontSize: '2rem', fontWeight: '700' }}>₹{total.toFixed(2)}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Lock size={16} />
              <span>Your payment is secure and encrypted</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={handleBack}
                style={{ ...getButtonStyle(), background: 'transparent', border: `2px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}` }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={handlePayment}
                disabled={processing}
                style={{ 
                  ...getButtonStyle(), 
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', 
                  color: 'white',
                  opacity: processing ? 0.6 : 1,
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Processing...' : 'Confirm & Pay ₹' + total.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
