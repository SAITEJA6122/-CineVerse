import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart, Bookmark, Flame, Calendar as CalendarIcon, Sparkles, Play } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

const MovieCard = ({ movie, delay = 0 }) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const getGenreClass = (genre) => {
    if (!genre) return '';
    const genreLower = genre.toLowerCase().replace(/\s+/g, '-');
    return `genre-${genreLower}`;
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
  };

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    setIsWatchlisted(!isWatchlisted);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.target.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance) {
      // Swipe left - add to watchlist
      setIsWatchlisted(!isWatchlisted);
    } else if (swipeDistance < -minSwipeDistance) {
      // Swipe right - add to favorites
      setIsFavorited(!isFavorited);
    }
  };

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
    color: theme === 'dark' ? '#ffffff' : 'var(--text-primary)'
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
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.75rem',
    fontWeight: '700',
    zIndex: 10,
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  };

  const quickActionsStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 10,
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? 'translateX(0)' : 'translateX(20px)',
    transition: 'all 0.3s ease'
  };

  const actionButtonStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)',
    color: isFavorited || isWatchlisted ? 'var(--primary)' : 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s ease'
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
        className="card card-3d slide-up"
        style={{ animationDelay: `${delay}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {(movie.isTrending || movie.isUpcoming || movie.isComingSoon) && (
            <div style={badgeStyle}>
              {movie.isTrending ? <><Flame size={14} /> Trending</> : movie.isUpcoming ? <><CalendarIcon size={14} /> Upcoming</> : <><Sparkles size={14} /> Coming Soon</>}
            </div>
          )}
          <div style={quickActionsStyle}>
            <button 
              style={actionButtonStyle} 
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
            <button 
              style={actionButtonStyle} 
              onClick={handleWatchlistClick}
              title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Bookmark size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
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
              background: 'linear-gradient(to top, rgba(15, 15, 35, 0.9), transparent 50%)',
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
                <Play size={18} /> View Details
              </span>
            </div>
          )}
        </div>
        <div style={contentStyle}>
          <h3 style={titleStyle}>{movie.title}</h3>
          <div style={{ marginBottom: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {Array.isArray(movie.genre) ? movie.genre.slice(0, 2).map((g, i) => (
              <span key={i} className={`genre-badge ${getGenreClass(g)}`}>{g}</span>
            )) : <span className={`genre-badge ${getGenreClass(movie.genre)}`}>{movie.genre}</span>}
          </div>
          <p style={genreStyle}>
            {movie.language}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {movie.rating > 0 && (
              <span style={ratingStyle}>
                <Star size={14} fill={movie.rating ? 'currentColor' : 'none'} /> {movie.rating.toFixed(1)}
              </span>
            )}
            <span style={durationStyle}>
              <Clock size={14} /> {movie.duration} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
