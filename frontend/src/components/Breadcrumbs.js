import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

const Breadcrumbs = ({ customBreadcrumbs = null }) => {
  const { theme } = React.useContext(ThemeContext);
  const location = useLocation();

  const breadcrumbStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0',
    fontSize: '0.95rem',
    color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)'
  };

  const linkStyle = {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  };

  const activeStyle = {
    color: theme === 'dark' ? 'var(--text-primary-dark)' : 'var(--text-primary)',
    fontWeight: '600',
    pointerEvents: 'none'
  };

  const separatorStyle = {
    color: theme === 'dark' ? 'var(--text-secondary-dark)' : 'var(--text-secondary)',
    opacity: 0.5
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs;

    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [
      { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format segment to readable title
      const title = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label: title,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" style={breadcrumbStyle}>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index === 0 ? (
            <Link to={crumb.path} style={linkStyle}>
              <Home size={16} />
            </Link>
          ) : (
            <Link
              to={crumb.path}
              style={crumb.isActive ? activeStyle : linkStyle}
              onClick={(e) => crumb.isActive && e.preventDefault()}
            >
              {crumb.label}
            </Link>
          )}
          {index < breadcrumbs.length - 1 && (
            <ChevronRight size={14} style={separatorStyle} />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
