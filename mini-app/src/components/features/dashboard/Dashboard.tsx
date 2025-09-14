import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocketContext } from '@/services/WebSocketContext';
import './Dashboard.css';

interface DashboardStats {
    totalCalls: number;
    activeCalls: number;
    totalUsers: number;
    callSuccess: number;
    creditUsage: number;
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { sendMessage, lastMessage } = useWebSocketContext();
    const [stats, setStats] = useState<DashboardStats>({
        totalCalls: 0,
        activeCalls: 0,
        totalUsers: 0,
        callSuccess: 0,
        creditUsage: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Request initial stats
        sendMessage({
            type: 'get_dashboard_stats'
        });

        // Set up interval for real-time updates
        const interval = setInterval(() => {
            sendMessage({
                type: 'get_dashboard_stats'
            });
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [sendMessage]);

    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage);
                if (data.type === 'dashboard_stats') {
                    setStats(data.stats);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        }
    }, [lastMessage]);

    return (
        <div className="dashboard animate-fade-in">
            {/* User Welcome Section */}
            <div className="welcome-card glass">
                <div className="user-info">
                    <div className="avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>
                        )}
                    </div>
                    <div className="user-details">
                        <h1>Welcome back, {user?.name}!</h1>
                        <p className="role-badge">{user?.role === 'admin' ? '👑 Admin' : '👤 User'}</p>
                    </div>
                </div>
                <div className="quick-stats">
                    <div className="stat-card hover-scale">
                        <span className="stat-value gradient-text">{user?.credits || 0}</span>
                        <span className="stat-label">Credits</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card glass hover-scale">
                    <div className="stat-icon calls-icon">📞</div>
                    <div className="stat-content">
                        <h3>Total Calls</h3>
                        <div className="stat-value animate-slide-up">{stats.totalCalls}</div>
                    </div>
                </div>

                <div className="stat-card glass hover-scale">
                    <div className="stat-icon active-icon">🟢</div>
                    <div className="stat-content">
                        <h3>Active Calls</h3>
                        <div className="stat-value animate-slide-up">{stats.activeCalls}</div>
                    </div>
                </div>

                {user?.role === 'admin' && (
                    <>
                        <div className="stat-card glass hover-scale">
                            <div className="stat-icon users-icon">👥</div>
                            <div className="stat-content">
                                <h3>Total Users</h3>
                                <div className="stat-value animate-slide-up">{stats.totalUsers}</div>
                            </div>
                        </div>

                        <div className="stat-card glass hover-scale">
                            <div className="stat-icon success-icon">✅</div>
                            <div className="stat-content">
                                <h3>Success Rate</h3>
                                <div className="stat-value animate-slide-up">
                                    {Math.round((stats.callSuccess / stats.totalCalls) * 100) || 0}%
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions glass">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <button className="action-button hover-scale" onClick={() => { }}>
                        <span>📞</span>
                        New Call
                    </button>
                    <button className="action-button hover-scale" onClick={() => { }}>
                        <span>💬</span>
                        Send SMS
                    </button>
                    {user?.role === 'admin' && (
                        <>
                            <button className="action-button hover-scale" onClick={() => { }}>
                                <span>👥</span>
                                Manage Users
                            </button>
                            <button className="action-button hover-scale" onClick={() => { }}>
                                <span>📊</span>
                                View Reports
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};