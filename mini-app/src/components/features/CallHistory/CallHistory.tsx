import React from 'react';
import { CallData } from '../../../types/bot';
import { formatDate, formatDuration } from '../../../utils/formatting';
import DashboardCard from '../../common/DashboardCard/DashboardCard';
import './CallHistory.css';

interface CallHistoryProps {
  calls: CallData[];
  onViewTranscript: (call: CallData) => void;
  onRefresh: () => void;
}

const CallHistory: React.FC<CallHistoryProps> = ({ calls, onViewTranscript, onRefresh }) => {
  if (calls.length === 0) {
    return (
      <div className='empty-state'>
        <div className='empty-icon'>📞</div>
        <p>No calls found</p>
        <button className='refresh-btn' onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div className='call-history'>
      {calls.map(call => (
        <DashboardCard
          key={call.call_sid}
          className='call-item'
          onClick={() => onViewTranscript(call)}
        >
          <div className='call-header'>
            <div className='call-info'>
              <div className='call-phone'>📞 {call.phone_number}</div>
              <div className='call-time'>{formatDate(call.created_at)}</div>
            </div>
            <div className={`call-status status-${call.status?.toLowerCase()}`}>{call.status}</div>
          </div>
          <div className='call-details'>
            <span className='call-duration'>
              ⏱️ {call.duration ? formatDuration(call.duration) : 'N/A'}
            </span>
            <span className='call-transcript-count'>💬 {call.transcript_count || 0} messages</span>
          </div>
        </DashboardCard>
      ))}
    </div>
  );
};

export default CallHistory;
