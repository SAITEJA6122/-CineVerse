import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';

const MovieCard = ({ movie, delay = 0 }) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  const imgStyle = {
    width: '100%',
    height: '340px',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
    transform: isHovered ? 'scale(1.08)' : 'scale(1)'
  };

  const contentStyle = {
    padding: '1.4rem'
  };

  const titleStyle = {
    fontSize: '1.15rem',
    fontWeight: '700',
    marginBottom: '0.6rem',
    color: 'inherit'
  };

  const genreStyle = {
    color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginBottom: '0.7rem',
    lineHeight: '1.4'
  };

  const ratingStyle = {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  };

  const badgeStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
    color: 'white',
    padding: '0.5rem 0.9rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8rem',
    fontWeight: '700',
    zIndex: 10,
    boxShadow: 'var(--shadow-md)'
  };

  const durationStyle = {
    color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  };

  return (
    <Link to={`/movie/${movie._id}`} style={{ textDecoration: 'none' }}>
      <div 
        className="card slide-up"
        style={{ animationDelay: `${delay}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {(movie.isTrending || movie.isUpcoming || movie.isComingSoon) && (
            <div style={badgeStyle}>
              {movie.isTrending ? '🔥 Trending' : movie.isUpcoming ? '📅 Upcoming' : '🎉 Coming Soon'}
            </div>
          )}
          <img 
            src={movie.poster || 'https://picsum.photos/400/600?random=' + movie._id} 
            alt={`${movie.title} movie poster`}
            style={imgStyle}
            loading="lazy"
          />
          {isHovered && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(15, 15, 35, 0.85), transparent 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '1.5rem',
              opacity: 1,
              transition: 'opacity 0.3s ease'
            }}>
              <span style={{
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                View Details →
              </span>
            </div>
          )}
        </div>
        <div style={contentStyle}>
          <h3 style={titleStyle}>{movie.title}</h3>
          <p style={genreStyle}>
            {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {movie.rating > 0 && (
              <span style={ratingStyle}>
                ⭐ {movie.rating.toFixed(1)}
              </span>
            )}
            <span style={durationStyle}>
              ⏱ {movie.duration} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
