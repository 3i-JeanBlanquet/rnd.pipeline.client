import React, { useState, ReactNode } from 'react';
import styles from './Expandable.module.css';

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
    <div className={styles.expandable}>
      <div
        onClick={toggleExpanded}
        className={styles.header}
      >
        <div className={styles.headerContent}>
          {icon && (
            <div className={styles.iconContainer}>
              {icon}
            </div>
          )}
          <h2 className={styles.title}>
            {title.split('› ').map((part, index) => (
              <span key={index}>
                {index > 0 && (
                  <span className={styles.titleSeparator}>›</span>
                )}
                <span className={index === 0 ? styles.titlePart : styles.titlePartActive}>
                  {part}
                </span>
              </span>
            ))}
          </h2>
          {badge && (
            <span className={styles.badge}>
              {badge}
            </span>
          )}
        </div>
        <div className={`${styles.arrow} ${isExpanded ? styles.arrowExpanded : ''}`}>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.arrowSvg}
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
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Expandable;
