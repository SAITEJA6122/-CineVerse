import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '450px',
    background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
    borderRadius: '16px',
    padding: '3rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    border: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '1rem',
    marginBottom: hasError ? '0.5rem' : '1.5rem',
    borderRadius: '8px',
    border: `2px solid ${hasError ? '#e94560' : (theme === 'dark' ? '#3a3a5a' : '#e0e0e0')}`,
    fontSize: '1rem',
    background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
    color: theme === 'dark' ? '#f0f0f0' : '#333',
    transition: 'border-color 0.3s ease'
  });

  const buttonStyle = {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: theme === 'dark' ? '#f0f0f0' : '#333'
  };

  const subtitleStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
    color: theme === 'dark' ? '#aaa' : '#666'
  };

  const errorStyle = {
    color: '#e94560',
    fontSize: '0.9rem',
    marginBottom: '1rem'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>Welcome Back!</h2>
        <p style={subtitleStyle}>Sign in to continue booking movies</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: ''}); }}
            style={inputStyle(errors.email)}
            required
            onFocus={(e) => e.target.style.borderColor = '#e94560'}
            onBlur={(e) => e.target.style.borderColor = errors.email ? '#e94560' : (theme === 'dark' ? '#3a3a5a' : '#e0e0e0')}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({...errors, password: ''}); }}
            style={inputStyle(errors.password)}
            required
            onFocus={(e) => e.target.style.borderColor = '#e94560'}
            onBlur={(e) => e.target.style.borderColor = errors.password ? '#e94560' : (theme === 'dark' ? '#3a3a5a' : '#e0e0e0')}
          />
          {errors.password && <p style={errorStyle}>{errors.password}</p>}
          
          <button 
            type="submit" 
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = 0.9)}
            onMouseLeave={(e) => e.target.style.opacity = loading ? 0.7 : 1}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: theme === 'dark' ? '#aaa' : '#666' }}>
          Don't have an account? <Link to="/register" style={{ color: '#e94560', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
