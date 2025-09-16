import React from 'react';
import { StatsData } from '../../../types/bot';
import DashboardCard from '../../common/DashboardCard/DashboardCard';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import './StatsGrid.css';

interface StatsGridProps {
  stats: StatsData | null;
  isLoading: boolean;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner message='Loading statistics...' />;
  }

  if (!stats) {
    return (
      <div className='stats-error'>
        <p>Unable to load statistics</p>
      </div>
    );
  }

  return (
    <div className='stats-grid'>
      <DashboardCard className='stat-card'>
        <div className='stat-content'>
          <div className='stat-icon'>📞</div>
          <div className='stat-info'>
            <div className='stat-number'>{stats.total_calls || 0}</div>
            <div className='stat-label'>Total Calls</div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className='stat-card'>
        <div className='stat-content'>
          <div className='stat-icon'>💬</div>
          <div className='stat-info'>
            <div className='stat-number'>{stats.total_sms || 0}</div>
            <div className='stat-label'>SMS Sent</div>
          </div>
        </div>
      </DashboardCard>

      {stats.error && (
        <DashboardCard className='stat-card error'>
          <div className='stat-content'>
            <div className='stat-icon'>⚠️</div>
            <div className='stat-info'>
              <div className='stat-label'>Stats Error</div>
              <div className='stat-error-text'>{stats.error}</div>
            </div>
          </div>
        </DashboardCard>
      )}
    </div>
  );
};

export default StatsGrid;
