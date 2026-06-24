import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, X, Eye, EyeOff, Facebook, Chrome } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'var(--error)', 'var(--warning)', '#ffc107', 'var(--success)', 'var(--success)'];
    
    return { score, label: labels[score], color: colors[score] };
  };

  const handleSocialLogin = (provider) => {
    // Placeholder for social login implementation
    console.log(`Social login with ${provider}`);
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

  const passwordStrength = getPasswordStrength(password);

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle} className="fade-in">
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
          
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({...errors, password: ''}); }}
              style={{ ...inputStyle(errors.password), paddingRight: '3rem' }}
              required
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: errors.password ? '2.2rem' : '1.4rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
                padding: 0
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p id="password-error" style={errorStyle}>{errors.password}</p>}
          
          {password && (
            <div style={{ marginBottom: '1.6rem' }}>
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: level <= passwordStrength.score ? passwordStrength.color : theme === 'dark' ? 'var(--border-dark)' : 'var(--border)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
              <p style={{ 
                fontSize: '0.85rem', 
                color: passwordStrength.color,
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                {passwordStrength.label}
              </p>
              <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
                {passwordStrength.score < 3 && 'Add uppercase, numbers, or special characters'}
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.6rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ marginLeft: 'auto', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>
              Forgot password?
            </Link>
          </div>
          
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
        
        <div style={{ margin: '2rem 0', position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: 0, 
            right: 0, 
            height: '1px', 
            background: theme === 'dark' ? 'var(--border-dark)' : 'var(--border)' 
          }} />
          <span style={{ 
            position: 'relative', 
            background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)', 
            padding: '0 1rem', 
            color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            Or continue with
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            style={{
              flex: 1,
              padding: '0.8rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
              background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => e.target.style.background = theme === 'dark' ? 'var(--bg-dark)' : '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.background = theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)'}
          >
            <Chrome size={20} /> Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            style={{
              flex: 1,
              padding: '0.8rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
              background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => e.target.style.background = theme === 'dark' ? 'var(--bg-dark)' : '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.background = theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)'}
          >
            <Facebook size={20} /> Facebook
          </button>
        </div>
        
        <p style={{ textAlign: 'center', color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
