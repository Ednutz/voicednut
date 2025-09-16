import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useApi } from '../../hooks/useApi';
import { useNotifications } from '../../hooks/useNotifications';
import { botApi } from '../../services/botApi';
import { StatsData } from '../../types/bot';

// Import components
import DashboardCard from '../../components/common/DashboardCard/DashboardCard';
import QuickActionButton from '../../components/common/QuickActionButton/QuickActionButton';
import StatsGrid from '../../components/features/Dashboard/StatsGrid';

import './HomePage.css';

interface HomePageProps {
  user: any;
  isAdmin: boolean;
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, isAdmin, onNavigate }) => {
  const { showMainButton, hideMainButton, hapticFeedback } = useTelegram();
  const { success } = useNotifications();
  const { data: stats, execute: fetchStats, isLoading: statsLoading } = useApi<StatsData>();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Configure main button for quick call action
    showMainButton('📞 Quick Call', () => {
      hapticFeedback('impact');
      onNavigate('calls');
    });

    // Fetch initial data
    fetchStats(() => botApi.getStats());
    loadRecentActivity();

    return () => {
      hideMainButton();
    };
  }, [showMainButton, hideMainButton, hapticFeedback, onNavigate, fetchStats]);

  const loadRecentActivity = async () => {
    try {
      const response = await botApi.getActivity(5);
      if (response.success) {
        setRecentActivity(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const handleQuickCall = () => {
    hapticFeedback('impact');
    success('Opening call interface...');
    onNavigate('calls');
  };

  const handleQuickSMS = () => {
    hapticFeedback('impact');
    success('Opening SMS interface...');
    onNavigate('sms');
  };

  const handleAdminPanel = () => {
    hapticFeedback('impact');
    onNavigate('admin');
  };

  return (
    <div className='home-page'>
      {/* Header */}
      <div className='home-header'>
        <div className='welcome-section'>
          <h1 className='welcome-title'>Welcome back, {user?.first_name || 'User'}!</h1>
          <p className='welcome-subtitle'>
            {isAdmin ? 'Administrator Dashboard' : 'Voice Call & SMS Manager'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <section className='quick-actions'>
        <h2 className='section-title'>Quick Actions</h2>
        <div className='actions-grid'>
          <QuickActionButton
            icon='📞'
            title='Make Call'
            description='Start a new voice call'
            onClick={handleQuickCall}
            primary
          />
          <QuickActionButton
            icon='💬'
            title='Send SMS'
            description='Send text message'
            onClick={handleQuickSMS}
          />
          {isAdmin && (
            <QuickActionButton
              icon='👥'
              title='Admin Panel'
              description='Manage users & settings'
              onClick={handleAdminPanel}
            />
          )}
        </div>
      </section>

      {/* Statistics */}
      <section className='stats-section'>
        <h2 className='section-title'>Your Statistics</h2>
        <StatsGrid stats={stats} isLoading={statsLoading} />
      </section>

      {/* Recent Activity */}
      <section className='activity-section'>
        <h2 className='section-title'>Recent Activity</h2>
        <DashboardCard>
          {recentActivity.length > 0 ? (
            <div className='activity-list'>
              {recentActivity.map((item, index) => (
                <div key={index} className='activity-item'>
                  <div className='activity-icon'>{item.type === 'call' ? '📞' : '💬'}</div>
                  <div className='activity-content'>
                    <div className='activity-title'>
                      {item.type === 'call' ? 'Call to' : 'SMS to'} {item.phone_number || item.to}
                    </div>
                    <div className='activity-time'>
                      {new Date(item.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className='activity-status'>
                    <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='empty-state'>
              <div className='empty-icon'>📋</div>
              <p>No recent activity</p>
            </div>
          )}
        </DashboardCard>
      </section>

      {/* Health Status */}
      <section className='health-section'>
        <DashboardCard>
          <div className='health-indicator'>
            <div className='health-status'>
              <div className='status-dot status-online'></div>
              <span>All systems operational</span>
            </div>
            <div className='health-details'>
              <small>Last updated: {new Date().toLocaleTimeString()}</small>
            </div>
          </div>
        </DashboardCard>
      </section>
    </div>
  );
};

export default HomePage;
