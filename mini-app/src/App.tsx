import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';

// Import your page components
import HomePage from './pages/HomePage/HomePage';
import CallsPage from './pages/CallsPage/CallsPage';
import SMSPage from './pages/SMSPage/SMSPage';
import AdminPage from './pages/AdminPage/AdminPage';
import LoadingScreen from './components/common/LoadingScreen/LoadingScreen';
import ErrorScreen from './components/common/ErrorScreen/ErrorScreen';
import Navigation from './components/common/Navigation/Navigation';

import './styles/globals.css';

const App: React.FC = () => {
  const { tg, user, isReady, themeParams, colorScheme } = useTelegram();
  const { isAuthenticated, isAdmin, isLoading: authLoading, error: authError } = useAuth();
  const { error: notifyError } = useNotifications();
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Apply Telegram theme colors to CSS variables
    if (themeParams && isReady) {
      const root = document.documentElement;

      Object.entries(themeParams).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--tg-${key.replace(/_/g, '-')}`, value);
        }
      });

      // Set color scheme class
      document.body.className = `theme-${colorScheme}`;
    }
  }, [themeParams, colorScheme, isReady]);

  useEffect(() => {
    // Handle authentication errors
    if (authError) {
      notifyError('Authentication failed. Please restart the bot.');
    }
  }, [authError, notifyError]);

  // Show loading screen while initializing
  if (!isReady || authLoading) {
    return <LoadingScreen message='Initializing VoicedNut...' />;
  }

  // Show error screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorScreen
        title='Access Denied'
        message='You are not authorized to use this Mini App. Please contact an administrator.'
        action={{
          label: 'Contact Admin',
          onClick: () => tg?.close()
        }}
      />
    );
  }

  return (
    <div className='app'>
      <Router>
        <div className='app-container'>
          {/* Main Content */}
          <main className='app-main'>
            <Routes>
              <Route
                path='/'
                element={<HomePage user={user} isAdmin={isAdmin} onNavigate={setCurrentPage} />}
              />
              <Route path='/calls' element={<CallsPage onNavigate={setCurrentPage} />} />
              <Route path='/sms' element={<SMSPage onNavigate={setCurrentPage} />} />
              <Route
                path='/admin'
                element={
                  isAdmin ? <AdminPage onNavigate={setCurrentPage} /> : <Navigate to='/' replace />
                }
              />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </main>

          {/* Bottom Navigation */}
          <Navigation currentPage={currentPage} isAdmin={isAdmin} onNavigate={setCurrentPage} />
        </div>
      </Router>
    </div>
  );
};

export default App;
