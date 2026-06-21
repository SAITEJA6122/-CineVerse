import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import Search from './Search';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navStyle = {
    background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
    padding: '1rem 0',
    color: theme === 'dark' ? '#f0f0f0' : '#333',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`
  };

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#e94560',
    textDecoration: 'none'
  };

  const linkStyle = {
    color: theme === 'dark' ? '#f0f0f0' : '#333',
    textDecoration: 'none',
    padding: '0.5rem 0',
    transition: 'color 0.3s ease'
  };

  const buttonStyle = {
    background: '#e94560',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
    fontSize: '0.95rem'
  };

  const themeBtnStyle = {
    background: theme === 'dark' ? '#3a3a5a' : '#f0f0f0',
    border: 'none',
    padding: '0.6rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.2rem'
  };

  const hamburgerStyle = {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: theme === 'dark' ? '#f0f0f0' : '#333',
    display: 'none'
  };

  const mobileMenuStyle = {
    display: isMenuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem 0',
    borderTop: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`
  };

  return (
    <nav style={navStyle}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/" style={logoStyle} onClick={() => setIsMenuOpen(false)}>🎬 CineVerse</Link>
          
          {/* Search Component - desktop and mobile */}
          <div style={{ flex: 1, maxWidth: '400px', minWidth: '200px' }}>
            <Search />
          </div>
          
          {/* Desktop Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#e94560'} onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#f0f0f0' : '#333'}>Home</Link>
            
            {user && (
              <>
                <Link to="/profile" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#e94560'} onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#f0f0f0' : '#333'}>Profile</Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#e94560'} onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#f0f0f0' : '#333'}>Admin</Link>
                )}
              </>
            )}
            
            <button style={themeBtnStyle} onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <button style={buttonStyle} onClick={handleLogout} onMouseEnter={(e) => e.target.style.opacity = 0.9} onMouseLeave={(e) => e.target.style.opacity = 1}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" style={{ ...buttonStyle, textDecoration: 'none', display: 'inline-block' }}>Login</Link>
                <Link to="/register" style={{ ...buttonStyle, background: 'transparent', border: '1px solid #e94560', color: '#e94560' }}>Register</Link>
              </>
            )}
          </div>
          
          {/* Mobile Hamburger */}
          <button 
            style={{ ...hamburgerStyle, display: 'block' }} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <div style={mobileMenuStyle}>
          <Link to="/" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Home</Link>
          
          {user && (
            <>
              <Link to="/profile" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Profile</Link>
              
              {user.role === 'admin' && (
                <Link to="/admin" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Admin</Link>
              )}
            </>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button style={themeBtnStyle} onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <button style={buttonStyle} onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" style={{ ...buttonStyle, textDecoration: 'none', display: 'inline-block' }} onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" style={{ ...buttonStyle, background: 'transparent', border: '1px solid #e94560', color: '#e94560' }} onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Media Queries in Style Tag for Desktop */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
