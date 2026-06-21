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
    background: theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface)',
    padding: '1rem 0',
    color: 'inherit',
    boxShadow: 'var(--shadow-md)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
  };

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--primary)',
    textDecoration: 'none'
  };

  const linkStyle = {
    color: 'inherit',
    textDecoration: 'none',
    padding: '0.5rem 0',
    transition: 'color 0.2s ease',
    fontWeight: '500'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.95rem',
    fontWeight: '600'
  };

  const themeBtnStyle = {
    background: theme === 'dark' ? 'var(--border-dark)' : 'var(--border)',
    border: 'none',
    padding: '0.6rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'all 0.2s ease'
  };

  const hamburgerStyle = {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'inherit',
    display: 'none'
  };

  const mobileMenuStyle = {
    display: isMenuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem 0',
    borderTop: `1px solid ${theme === 'dark' ? 'var(--border-dark)' : 'var(--border)'}`
  };

  return (
    <nav style={navStyle}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/" style={logoStyle} onClick={() => setIsMenuOpen(false)} aria-label="Go to home page">🎬 CineVerse</Link>
          
          {/* Search Component - desktop and mobile */}
          <div style={{ flex: 1, maxWidth: '400px', minWidth: '200px' }}>
            <Search />
          </div>
          
          {/* Desktop Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'inherit'} aria-label="Go to home page">Home</Link>
            
            {user && (
              <>
                <Link to="/profile" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'inherit'} aria-label="Go to your profile">Profile</Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'inherit'} aria-label="Go to admin dashboard">Admin</Link>
                )}
              </>
            )}
            
            <button style={themeBtnStyle} onClick={toggleTheme} title="Toggle theme" aria-label="Toggle light/dark theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <button style={buttonStyle} onClick={handleLogout} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'} aria-label="Log out">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" style={{ ...buttonStyle, textDecoration: 'none', display: 'inline-block' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'} aria-label="Go to login page">Login</Link>
                <Link to="/register" style={{ ...buttonStyle, background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)' }} onMouseEnter={(e) => e.target.style.background = 'var(--primary-light)'} onMouseLeave={(e) => e.target.style.background = 'transparent'} aria-label="Go to register page">Register</Link>
              </>
            )}
          </div>
          
          {/* Mobile Hamburger */}
          <button 
            style={{ ...hamburgerStyle, display: 'block' }} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <div style={mobileMenuStyle} role="menu">
          <Link to="/" style={linkStyle} onClick={() => setIsMenuOpen(false)} role="menuitem">Home</Link>
          
          {user && (
            <>
              <Link to="/profile" style={linkStyle} onClick={() => setIsMenuOpen(false)} role="menuitem">Profile</Link>
              
              {user.role === 'admin' && (
                <Link to="/admin" style={linkStyle} onClick={() => setIsMenuOpen(false)} role="menuitem">Admin</Link>
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
                <Link to="/register" style={{ ...buttonStyle, background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)' }} onClick={() => setIsMenuOpen(false)}>Register</Link>
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
