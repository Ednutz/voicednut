import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...', progress }) => {
  return (
    <div className='loading-screen'>
      <div className='loading-content'>
        <div className='loading-logo'>🚀</div>
        <div className='loading-spinner'>
          <div className='spinner-ring'>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <p className='loading-message'>{message}</p>
        {progress !== undefined && (
          <div className='loading-progress'>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <span className='progress-text'>{Math.round(progress)}%</span>
          </div>
        )}
        <div className='loading-dots'>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
