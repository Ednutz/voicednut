import React from 'react';
import './QuickActionButton.css';

interface QuickActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  title,
  description,
  onClick,
  primary = false,
  disabled = false
}) => {
  return (
    <button
      className={`quick-action-btn ${primary ? 'primary' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className='action-icon'>{icon}</div>
      <div className='action-content'>
        <div className='action-title'>{title}</div>
        <div className='action-description'>{description}</div>
      </div>
    </button>
  );
};

export default QuickActionButton;
