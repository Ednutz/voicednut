import React, { useState, useEffect } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useNotifications } from '../../hooks/useNotifications';
import { useApi } from '../../hooks/useApi';
import { botApi } from '../../services/botApi';
import { UserData } from '../../types/bot';
import InputField from '../../components/common/InputField/InputField';
import DashboardCard from '../../components/common/DashboardCard/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { showBackButton, hideBackButton, hapticFeedback } = useTelegram();
  const { success, error } = useNotifications();
  const { data: users, execute: fetchUsers, isLoading } = useApi<UserData[]>();

  const [activeTab, setActiveTab] = useState<'users' | 'add'>('users');
  const [newUser, setNewUser] = useState({ telegramId: '', username: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    showBackButton(() => {
      hapticFeedback('impact');
      onNavigate('home');
    });

    loadUsers();

    return () => {
      hideBackButton();
    };
  }, [showBackButton, hideBackButton, hapticFeedback, onNavigate]);

  const loadUsers = async () => {
    try {
      await fetchUsers(() => botApi.getUsers());
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.telegramId.trim() || !newUser.username.trim()) {
      setFormErrors({
        telegramId: !newUser.telegramId.trim() ? 'Telegram ID is required' : '',
        username: !newUser.username.trim() ? 'Username is required' : ''
      });
      return;
    }

    try {
      await botApi.addUser(newUser.telegramId.trim(), newUser.username.trim());
      success('User added successfully!');
      setNewUser({ telegramId: '', username: '' });
      setFormErrors({});
      loadUsers();
    } catch (err) {
      console.error('Failed to add user:', err);
      error('Failed to add user. Please try again.');
    }
  };

  const handleRemoveUser = async (telegramId: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      try {
        await botApi.removeUser(telegramId);
        success('User removed successfully!');
        loadUsers();
      } catch (err) {
        console.error('Failed to remove user:', err);
        error('Failed to remove user. Please try again.');
      }
    }
  };

  const handlePromoteUser = async (telegramId: string) => {
    if (confirm('Are you sure you want to promote this user to admin?')) {
      try {
        await botApi.promoteUser(telegramId);
        success('User promoted successfully!');
        loadUsers();
      } catch (err) {
        console.error('Failed to promote user:', err);
        error('Failed to promote user. Please try again.');
      }
    }
  };

  return (
    <div className='admin-page'>
      <div className='page-header'>
        <h1 className='page-title'>👑 Admin Panel</h1>
        <p className='page-subtitle'>Manage users and system settings</p>
      </div>

      <div className='tab-navigation'>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ Add User
        </button>
      </div>

      <div className='page-content'>
        {activeTab === 'users' ? (
          <div className='users-section'>
            {isLoading ? (
              <LoadingSpinner message='Loading users...' />
            ) : (
              <div className='users-list'>
                {users && users.length > 0 ? (
                  users.map(user => (
                    <DashboardCard key={user.telegram_id}>
                      <div className='user-item'>
                        <div className='user-info'>
                          <div className='user-header'>
                            <span className='user-role-icon'>
                              {user.role === 'ADMIN' ? '👑' : '👤'}
                            </span>
                            <span className='user-username'>@{user.username}</span>
                            <span className='user-role'>{user.role}</span>
                          </div>
                          <div className='user-details'>
                            <small>ID: {user.telegram_id}</small>
                            <small>Joined: {new Date(user.timestamp).toLocaleDateString()}</small>
                          </div>
                        </div>
                        <div className='user-actions'>
                          {user.role !== 'ADMIN' && (
                            <button
                              className='action-btn promote-btn'
                              onClick={() => handlePromoteUser(user.telegram_id.toString())}
                            >
                              ⬆️ Promote
                            </button>
                          )}
                          <button
                            className='action-btn remove-btn'
                            onClick={() => handleRemoveUser(user.telegram_id.toString())}
                          >
                            ❌ Remove
                          </button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))
                ) : (
                  <div className='empty-state'>
                    <div className='empty-icon'>👥</div>
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className='add-user-section'>
            <DashboardCard>
              <InputField
                label='🆔 Telegram ID'
                placeholder='123456789'
                value={newUser.telegramId}
                error={formErrors.telegramId}
                onChange={value => {
                  setNewUser(prev => ({ ...prev, telegramId: value }));
                  if (formErrors.telegramId) {
                    setFormErrors(prev => ({ ...prev, telegramId: '' }));
                  }
                }}
                hint="The user's Telegram ID number"
              />

              <InputField
                label='👤 Username'
                placeholder='username'
                value={newUser.username}
                error={formErrors.username}
                onChange={value => {
                  setNewUser(prev => ({ ...prev, username: value }));
                  if (formErrors.username) {
                    setFormErrors(prev => ({ ...prev, username: '' }));
                  }
                }}
                hint='Username without @ symbol'
              />

              <button className='add-user-btn' onClick={handleAddUser}>
                ➕ Add User
              </button>
            </DashboardCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
