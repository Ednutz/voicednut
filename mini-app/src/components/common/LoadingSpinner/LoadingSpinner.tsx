import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium'
}) => {
  return (
    <div className='loading-container'>
      <div className={`loading-spinner ${size}`}>
        <div className='spinner-circle'></div>
      </div>
      {message && <div className='loading-message'>{message}</div>}
    </div>
  );
};

export default LoadingSpinner;
