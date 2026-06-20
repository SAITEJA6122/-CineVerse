import React, { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  const footerStyle = {
    background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
    color: theme === 'dark' ? '#f0f0f0' : '#333',
    padding: '2.5rem 0',
    marginTop: '4rem',
    borderTop: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`
  };

  return (
    <footer style={footerStyle}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: '#e94560', marginBottom: '1rem' }}>🎬 CineBook</h3>
            <p style={{ opacity: 0.8 }}>Your one-stop destination for movie tickets</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.8 }}>
              <span>Home</span>
              <span>Movies</span>
              <span>About Us</span>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Contact</h4>
            <div style={{ opacity: 0.8 }}>
              <p>Email: support@cinebook.com</p>
              <p>Phone: +1 234 567 890</p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`, opacity: 0.7 }}>
          <p>&copy; 2026 CineBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
