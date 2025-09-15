import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Sms as SmsIcon,
  Group as UsersIcon,
  Description as TranscriptsIcon,
  Settings as SettingsIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import { createTelegramTheme } from './styles/telegramTheme';
import { telegramWebApp } from './utils/telegramWebApp';
import { apiService } from './services/apiService';
import { MainLayout } from './components/MainLayout';
import { CallManager } from './components/CallManager/CallManager';
import { SMSComposer } from './components/SMSComposer/SMSComposer';
import { UserManager } from './components/UserManager/UserManager';
import { TranscriptViewer } from './components/TranscriptViewer/TranscriptViewer';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { ROUTES } from './routes/constants';

const navItems = [
  { path: ROUTES.HOME, label: 'Dashboard', icon: HomeIcon, requireAdmin: false },
  { path: ROUTES.CALL, label: 'Make Call', icon: PhoneIcon, requireAdmin: false },
  { path: ROUTES.SMS, label: 'Send SMS', icon: SmsIcon, requireAdmin: false },
  { path: ROUTES.USERS, label: 'Users', icon: UsersIcon, requireAdmin: true },
  { path: ROUTES.TRANSCRIPTS, label: 'Transcripts', icon: TranscriptsIcon, requireAdmin: true },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: SettingsIcon, requireAdmin: false },
];

interface AppState {
  initialized: boolean;
  authorized: boolean;
  isAdmin: boolean;
  error: string | null;
  theme: any;
  drawerOpen: boolean;
}

function AppContent() {
  const [state, setState] = useState<AppState>({
    initialized: false,
    authorized: false,
    isAdmin: false,
    error: null,
    theme: createTelegramTheme(),
    drawerOpen: false
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initializeApp();
    
    // Listen for theme changes
    const handleThemeChange = () => {
      setState(prev => ({ ...prev, theme: createTelegramTheme() }));
    };
    
    window.addEventListener('telegramThemeChanged', handleThemeChange);
    return () => window.removeEventListener('telegramThemeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    // Update back button based on current route
    if (location.pathname !== ROUTES.HOME) {
      telegramWebApp.showBackButton(() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(ROUTES.HOME);
        }
      });
    } else {
      telegramWebApp.hideBackButton();
    }

    return () => telegramWebApp.hideBackButton();
  }, [location.pathname, navigate]);

  const initializeApp = async () => {
    try {
      // Initialize Telegram WebApp
      await telegramWebApp.initialize();
      
      // Check user authorization
      const authResponse = await apiService.checkUserAuthorization();
      
      if (authResponse.success && authResponse.data) {
        setState(prev => ({
          ...prev,
          initialized: true,
          authorized: authResponse.data!.authorized,
          isAdmin: authResponse.data!.isAdmin
        }));

        if (!authResponse.data.authorized) {
          showMessage('You are not authorized to use this bot. Please contact an administrator.', 'error');
        } else {
          showMessage('Welcome to VoicedNut!', 'success');
        }
      } else {
        throw new Error(authResponse.error || 'Failed to check authorization');
      }
    } catch (error: any) {
      console.error('App initialization error:', error);
      setState(prev => ({
        ...prev,
        initialized: true,
        error: error.message || 'Failed to initialize app'
      }));
      showMessage('Failed to initialize app. Please try again.', 'error');
    }
  };

  const showMessage = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setState(prev => ({ ...prev, drawerOpen: false }));
    telegramWebApp.impactOccurred('light');
  };

  const handleDrawerToggle = () => {
    setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }));
    telegramWebApp.impactOccurred('light');
  };

  const getAvailableNavItems = () => {
    return navItems.filter(item => !item.requireAdmin || state.isAdmin);
  };

  // Loading state
  if (!state.initialized) {
    return (
      <ThemeProvider theme={state.theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            gap: 2,
            p: 3
          }}
        >
          <CircularProgress size={48} />
          <Box sx={{ textAlign: 'center' }}>
            <h2>VoicedNut</h2>
            <p>Initializing...</p>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Error state
  if (state.error) {
    return (
      <ThemeProvider theme={state.theme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <strong>Initialization Error</strong><br />
            {state.error}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  // Unauthorized state
  if (!state.authorized) {
    return (
      <ThemeProvider theme={state.theme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            <strong>Access Denied</strong><br />
            You are not authorized to use this bot. Please contact an administrator to get access.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  // Main app
  return (
    <ThemeProvider theme={state.theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Navigation Drawer */}
        <Drawer
          anchor="left"
          open={state.drawerOpen}
          onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
          PaperProps={{
            sx: {
              width: 280,
              bgcolor: 'background.paper',
              color: 'text.primary',
            },
          }}
        >
          <List sx={{ pt: 2 }}>
            {getAvailableNavItems().map(({ path, label, icon: Icon }) => (
              <ListItem
                button
                key={path}
                onClick={() => handleNavigation(path)}
                selected={location.pathname === path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText 
                  primary={label} 
                  primaryTypographyProps={{ fontWeight: location.pathname === path ? 600 : 400 }}
                />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          <MainLayout 
            title="VoicedNut" 
            onMenuClick={handleDrawerToggle}
          >
            <Routes>
              <Route path={ROUTES.HOME} element={<DashboardPage />} />
              <Route path={ROUTES.CALL} element={<CallManager />} />
              <Route path={ROUTES.SMS} element={<SMSComposer />} />
              {state.isAdmin && (
                <>
                  <Route path={ROUTES.USERS} element={<UserManager />} />
                  <Route path={ROUTES.TRANSCRIPTS} element={<TranscriptViewer />} />
                </>
              )}
              <Route path={ROUTES.SETTINGS} element={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <h2>Settings</h2>
                  <p>Settings feature coming soon...</p>
                </Box>
              } />
              {/* Catch all route */}
              <Route path="*" element={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <h2>Page Not Found</h2>
                  <p>The requested page could not be found.</p>
                </Box>
              } />
            </Routes>
          </MainLayout>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;