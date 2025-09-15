import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Sms as SmsIcon,
  Group as UsersIcon,
  Description as TranscriptsIcon,
  Settings as SettingsIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import WebApp from '@twa-dev/sdk';
import { theme } from './styles/theme';
import { MainLayout } from './components/MainLayout';
import { CallManager } from './components/CallManager';
import { SMSComposer } from './components/SMSComposer';
import { UserManager } from './components/UserManager';
import { TranscriptViewer } from './components/TranscriptViewer';
import { ROUTES } from './routes/constants';
import { DashboardPage } from './pages';

const navItems = [
  { path: ROUTES.HOME, label: 'Home', icon: HomeIcon },
  { path: ROUTES.CALL, label: 'Make Call', icon: PhoneIcon },
  { path: ROUTES.SMS, label: 'Send SMS', icon: SmsIcon },
  { path: ROUTES.USERS, label: 'Users', icon: UsersIcon },
  { path: ROUTES.TRANSCRIPTS, label: 'Transcripts', icon: TranscriptsIcon },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: SettingsIcon },
];

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.enableClosingConfirmation();

    return () => {
      WebApp.disableClosingConfirmation();
    };
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'background.paper',
            color: 'text.primary',
          },
        }}
      >
        <List sx={{ width: 250 }}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <ListItem
              button
              key={path}
              onClick={() => handleNavigation(path)}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <MainLayout title="VoicedNut" onMenuClick={() => setDrawerOpen(true)}>
          <Routes>
            <Route path={ROUTES.HOME} element={<DashboardPage />} />
            <Route path={ROUTES.CALL} element={<CallManager />} />
            <Route path={ROUTES.SMS} element={<SMSComposer />} />
            <Route path={ROUTES.USERS} element={<UserManager />} />
            <Route path={ROUTES.TRANSCRIPTS} element={<TranscriptViewer />} />
            <Route path={ROUTES.SETTINGS} element={
              <Box>
                <h1>Settings</h1>
                <p>Settings feature coming soon...</p>
              </Box>
            } />
          </Routes>
        </MainLayout>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;