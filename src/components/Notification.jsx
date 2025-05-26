import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className={`notification ${type} ${isDarkMode ? 'dark' : ''}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'slideIn 0.3s ease-out',
        border: `1px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'}`
      }}
    >
      <span className="notification-icon">{getIcon()}</span>
      <span className={`notification-message ${isDarkMode ? 'text-white' : 'text-dark'}`}>
        {message}
      </span>
    </div>
  );
};

export default Notification; 