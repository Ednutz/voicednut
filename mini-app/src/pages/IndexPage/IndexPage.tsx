import { type FC, useState, useEffect, type FormEvent, useCallback } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { AsyncContent, LoadingSpinner } from '@/components/common/AsyncContent/AsyncContent';
import { DataCard } from '@/components/common/DataCard/DataCard';
import './IndexPage.css';

interface UserStats {
  total_calls: number;
  total_sms: number;
  this_month_calls: number;
  this_month_sms: number;
  success_rate: number;
  last_activity: string;
  call_trend?: {
    value: number;
    isPositive: boolean;
  };
  sms_trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface CallFormData {
  phone: string;
  prompt: string;
  first_message: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
}

export const IndexPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'call' | 'sms'>('dashboard');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callForm, setCallForm] = useState<CallFormData>({
    phone: '',
    prompt: '',
    first_message: ''
  });

  const fetchUserStats = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user-stats/demo');
      const data = await response.json() as UserStats;
      setUserStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load user statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUserStats();
  }, [fetchUserStats]);

  const handleCallSubmit = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!callForm.phone || !callForm.prompt || !callForm.first_message) {
      setError('All fields are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/outbound-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: callForm.phone,
          prompt: callForm.prompt,
          first_message: callForm.first_message,
          initData: 'demo'
        })
      });

      const result = await response.json() as ApiResponse;

      if (result.success) {
        alert('Call initiated successfully!');
        setCallForm({ phone: '', prompt: '', first_message: '' });
        await fetchUserStats(); // Refresh stats
      } else {
        setError(result.error ?? 'Call failed');
      }
    } catch (err) {
      console.error('Call error:', err);
      setError('Failed to initiate call');
    } finally {
      setIsLoading(false);
    }
  }, [callForm, fetchUserStats]);

  const renderDashboard = () => (
    <div className="dashboard animate-in">
      <h1 className="dashboard__title gradient-text">VoicedNut Dashboard</h1>

      <AsyncContent
        isLoading={isLoading}
        error={error ? new Error(error) : null}
        data={userStats}
        loadingFallback={
          <div className="dashboard__stats">
            <DataCard title="Total Calls" loading />
            <DataCard title="Total SMS" loading />
            <DataCard title="Monthly Calls" loading />
            <DataCard title="Success Rate" loading />
          </div>
        }
      >
        {(stats) => (
          <div className="dashboard__stats">
            <DataCard
              title="Total Calls"
              value={stats.total_calls.toString()}
              trend={stats.call_trend}
              icon={<span>📞</span>}
            />
            <DataCard
              title="Total SMS"
              value={stats.total_sms.toString()}
              trend={stats.sms_trend}
              icon={<span>✉️</span>}
            />
            <DataCard
              title="Monthly Calls"
              value={stats.this_month_calls.toString()}
              icon={<span>📊</span>}
            />
            <DataCard
              title="Success Rate"
              value={`${stats.success_rate}%`}
              trend={{
                value: stats.success_rate - 50,
                isPositive: stats.success_rate >= 50
              }}
              icon={<span>📈</span>}
            />
          </div>
        )}
      </AsyncContent>
    </div>
  );

  const renderCallForm = () => (
    <div className="form-container animate-in">
      <h2 className="dashboard__title gradient-text">Make a Call</h2>

      <form className="form glass" onSubmit={handleCallSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            className="form-input"
            value={callForm.phone}
            onChange={(e) => setCallForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1234567890"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="prompt">AI Prompt</label>
          <textarea
            id="prompt"
            className="form-input form-textarea"
            value={callForm.prompt}
            onChange={(e) => setCallForm(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder="Enter AI conversation prompt..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="first_message">First Message</label>
          <textarea
            id="first_message"
            className="form-input form-textarea"
            value={callForm.first_message}
            onChange={(e) => setCallForm(prev => ({ ...prev, first_message: e.target.value }))}
            placeholder="Enter the first message..."
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="form-button"
          disabled={isLoading || !isConnected}
        >
          {isLoading ? 'Initiating Call...' : 'Start Call'}
        </button>
      </form>
    </div>
  );

  return (
    <div>
      <nav className="dashboard__nav">
        <button
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-button ${activeTab === 'call' ? 'active' : ''}`}
          onClick={() => setActiveTab('call')}
        >
          Make Call
        </button>
        <button
          className={`nav-button ${activeTab === 'sms' ? 'active' : ''}`}
          onClick={() => setActiveTab('sms')}
        >
          Send SMS
        </button>
      </nav>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'call' && renderCallForm()}
      {activeTab === 'sms' && (
        <div className="form-container animate-in">
          <h2 className="dashboard__title gradient-text">SMS Feature</h2>
          <p className="text-theme-hint text-center">SMS feature coming soon!</p>
        </div>
      )}
    </div>
  );
};