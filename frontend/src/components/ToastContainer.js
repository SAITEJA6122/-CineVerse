import React, { useContext } from 'react';
import ToastContext from '../context/ToastContext';

const ToastContainer = () => {
  const { toasts } = useContext(ToastContext);

  const toastStyles = {
    success: { background: '#4caf50', color: 'white' },
    error: { background: '#f44336', color: 'white' },
    info: { background: '#2196f3', color: 'white' },
    warning: { background: '#ff9800', color: 'white' }
  };

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const toastStyle = {
    padding: '15px 25px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'fadeIn 0.3s ease-out',
    maxWidth: '400px'
  };

  return (
    <div style={containerStyle}>
      {toasts.map(toast => (
        <div key={toast.id} style={{ ...toastStyle, ...toastStyles[toast.type] }}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
