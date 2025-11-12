import React, { useState, ReactNode } from 'react';

interface ExpandableProps {
  title: string;
  children: ReactNode;
  badge?: string | number;
  defaultExpanded?: boolean;
  icon?: ReactNode;
}

const Expandable: React.FC<ExpandableProps> = ({
  title,
  children,
  badge,
  defaultExpanded = false,
  icon
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      width: '100%',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0
    }}>
      <div
        onClick={toggleExpanded}
        style={{
          backgroundColor: '#f8f9fa',
          padding: '15px 20px',
          borderBottom: '1px solid #e9ecef',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background-color 0.2s ease',
          width: '100%',
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e9ecef';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              flexShrink: 0
            }}>
              {icon}
            </div>
          )}
          <h2 style={{ 
            margin: '0', 
            color: '#333',
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {title.split('› ').map((part, index) => (
              <span key={index}>
                {index > 0 && (
                  <span style={{ 
                    color: '#999', 
                    fontWeight: '400',
                    margin: '0 4px'
                  }}>›</span>
                )}
                <span style={{ 
                  color: index === 0 ? '#666' : '#333',
                  fontWeight: index === 0 ? '500' : '600'
                }}>
                  {part}
                </span>
              </span>
            ))}
          </h2>
          {badge && (
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          width: '24px',
          height: '24px'
        }}>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transition: 'all 0.3s ease'
            }}
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="#666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{ 
          padding: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Expandable;
