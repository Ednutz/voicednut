import React from 'react';
import './DashboardCard.css';

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  title,
  className = '',
  onClick
}) => {
  return (
    <div className={`dashboard-card ${className} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      {title && <div className='card-title'>{title}</div>}
      <div className='card-content'>{children}</div>
    </div>
  );
};

export default DashboardCard;
