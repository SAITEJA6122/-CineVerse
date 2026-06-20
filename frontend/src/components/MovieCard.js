import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';

const MovieCard = ({ movie }) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    background: theme === 'dark' ? '#1e1e3a' : '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
    boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
    border: `1px solid ${theme === 'dark' ? '#3a3a5a' : '#e0e0e0'}`
  };

  const imgStyle = {
    width: '100%',
    height: '320px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
  };

  const contentStyle = {
    padding: '1.2rem'
  };

  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: theme === 'dark' ? '#f0f0f0' : '#333'
  };

  const genreStyle = {
    color: theme === 'dark' ? '#aaa' : '#666',
    fontSize: '0.9rem',
    marginBottom: '0.5rem'
  };

  const ratingStyle = {
    background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
    color: 'white',
    padding: '0.3rem 0.7rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    display: 'inline-block'
  };

  const badgeStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#e94560',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    zIndex: 10
  };

  return (
    <Link to={`/movie/${movie._id}`} style={{ textDecoration: 'none' }}>
      <div 
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {(movie.isTrending || movie.isUpcoming) && (
            <div style={badgeStyle}>
              {movie.isTrending ? '🔥 Trending' : '📅 Upcoming'}
            </div>
          )}
          <img 
            src={movie.poster || 'https://picsum.photos/400/600?random=0'} 
            alt={movie.title}
            style={imgStyle}
            loading="lazy"
          />
        </div>
        <div style={contentStyle}>
          <h3 style={titleStyle}>{movie.title}</h3>
          <p style={genreStyle}>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {movie.rating && <span style={ratingStyle}>⭐ {movie.rating.toFixed(1)}</span>}
            <span style={{ color: theme === 'dark' ? '#888' : '#888', fontSize: '0.85rem' }}>
              {movie.duration} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
