import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

const ErrorPage = ({ 
  errorCode = 404, 
  errorMessage = 'Page not found', 
  errorDescription = 'The page you are looking for does not exist or has been moved.',
  showRetry = false,
  onRetry = null
}) => {
  const { theme } = React.useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg)'
  };

  const contentStyle = {
    maxWidth: '600px',
    textAlign: 'center',
    padding: '3rem',
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    borderRadius: 'var(--radius-xl)',
    border: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
    boxShadow: 'var(--shadow-lg)'
  };

  const iconStyle = {
    width: '120px',
    height: '120px',
    margin: '0 auto 2rem',
    color: 'var(--error)',
    opacity: 0.9
  };

  const buttonStyle = {
    padding: '0.8rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'transparent',
    border: `2px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`,
    color: 'inherit'
  };

  const getErrorContent = (code) => {
    switch (code) {
      case 400:
        return {
          icon: <AlertCircle size={120} />,
          title: 'Bad Request',
          description: 'The request was invalid or cannot be processed. Please check your input and try again.'
        };
      case 401:
        return {
          icon: <AlertCircle size={120} />,
          title: 'Unauthorized',
          description: 'You need to log in to access this page. Please sign in and try again.'
        };
      case 403:
        return {
          icon: <AlertCircle size={120} />,
          title: 'Access Denied',
          description: 'You do not have permission to access this page. Contact support if you believe this is an error.'
        };
      case 404:
        return {
          icon: <AlertCircle size={120} />,
          title: 'Page Not Found',
          description: 'The page you are looking for does not exist or has been moved to a different location.'
        };
      case 500:
        return {
          icon: <AlertCircle size={120} />,
          title: 'Server Error',
          description: 'Something went wrong on our end. Our team has been notified and is working to fix it.'
        };
      case 503:
        return {
          icon: <AlertCircle size={120} />,
          title: 'Service Unavailable',
          description: 'Our service is temporarily unavailable. Please try again later.'
        };
      default:
        return {
          icon: <AlertCircle size={120} />,
          title: errorMessage,
          description: errorDescription
        };
    }
  };

  const errorContent = getErrorContent(errorCode);

  return (
    <div style={containerStyle}>
      <div style={contentStyle} className="fade-in">
        <div style={iconStyle}>
          {errorContent.icon}
        </div>
        
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          color: 'var(--error)', 
          marginBottom: '1rem' 
        }}>
          {errorCode}
        </h1>
        
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '700', 
          color: 'inherit', 
          marginBottom: '1rem' 
        }}>
          {errorContent.title}
        </h2>
        
        <p style={{ 
          color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)', 
          fontSize: '1.1rem', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {errorContent.description}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {showRetry && (
            <button
              onClick={handleRetry}
              style={primaryButtonStyle}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <RefreshCw size={18} /> Try Again
            </button>
          )}
          
          <button
            onClick={handleGoBack}
            style={secondaryButtonStyle}
            onMouseEnter={(e) => e.target.style.background = theme === 'dark' ? 'var(--bg-dark)' : '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            style={primaryButtonStyle}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Home size={18} /> Back to Home
          </button>
        </div>

        {location.pathname !== '/' && (
          <p style={{ 
            marginTop: '2rem', 
            fontSize: '0.9rem', 
            color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)' 
          }}>
            URL: {window.location.href}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
