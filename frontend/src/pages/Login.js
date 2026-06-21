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
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '480px',
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '3.5rem',
    boxShadow: 'var(--shadow-lg)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '1.1rem',
    marginBottom: hasError ? '0.6rem' : '1.6rem',
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${hasError ? 'var(--error)' : (theme === 'dark' ? 'var(--border-dark)' : 'var(--border)')}`,
    fontSize: '1rem',
    background: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg)',
    color: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none'
  });

  const buttonStyle = {
    width: '100%',
    padding: '1.1rem',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
  };

  const titleStyle = {
    fontSize: '2.2rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '0.6rem',
    color: 'inherit'
  };

  const subtitleStyle = {
    textAlign: 'center',
    marginBottom: '2.2rem',
    color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'
  };

  const errorStyle = {
    color: 'var(--error)',
    fontSize: '0.9rem',
    marginBottom: '1.2rem',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem' }}>🎬</div>
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
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && <p id="email-error" style={errorStyle}>{errors.email}</p>}
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({...errors, password: ''}); }}
            style={inputStyle(errors.password)}
            required
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && <p id="password-error" style={errorStyle}>{errors.password}</p>}
          
          <button 
            type="submit" 
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.8rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
