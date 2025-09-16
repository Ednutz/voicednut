import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTelegram } from '../../../hooks/useTelegram';
import './Navigation.css';

interface NavigationProps {
  currentPage: string;
  isAdmin: boolean;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticFeedback } = useTelegram();

  const handleNavigate = (path: string, page: string) => {
    if (location.pathname !== path) {
      hapticFeedback('impact');
      navigate(path);
      onNavigate(page);
    }
  };

  const navItems = [
    { path: '/', page: 'home', icon: '🏠', label: 'Home' },
    { path: '/calls', page: 'calls', icon: '📞', label: 'Calls' },
    { path: '/sms', page: 'sms', icon: '💬', label: 'SMS' },
    ...(isAdmin ? [{ path: '/admin', page: 'admin', icon: '👑', label: 'Admin' }] : [])
  ];

  return (
    <nav className='bottom-navigation'>
      {navItems.map(item => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => handleNavigate(item.path, item.page)}
        >
          <div className='nav-icon'>{item.icon}</div>
          <div className='nav-label'>{item.label}</div>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
