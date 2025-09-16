import React from 'react';
import { useTelegram } from '../../../hooks/useTelegram';
import './ErrorScreen.css';

interface ErrorScreenProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ title, message, action, icon = '❌' }) => {
  const { hapticFeedback } = useTelegram();

  const handleActionClick = () => {
    if (action) {
      hapticFeedback('impact');
      action.onClick();
    }
  };

  return (
    <div className='error-screen'>
      <div className='error-content'>
        <div className='error-icon'>{icon}</div>
        <h1 className='error-title'>{title}</h1>
        <p className='error-message'>{message}</p>
        {action && (
          <button className='error-action-btn' onClick={handleActionClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;
