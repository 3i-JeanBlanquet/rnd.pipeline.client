import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        padding: '12px',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px 20px',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #ffc107',
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          pointerEvents: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '18px' }}>⏳</span>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#856404',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;

