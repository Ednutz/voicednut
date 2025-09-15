import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import WebApp from '@twa-dev/sdk';

interface MainLayoutProps {
    children: React.ReactNode;
    title: string;
    onMenuClick?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title, onMenuClick }) => {
    // Automatically adjust theme to match Telegram's theme
    React.useEffect(() => {
        WebApp.setHeaderColor(WebApp.themeParams.secondary_bg_color);
        WebApp.setBackgroundColor(WebApp.themeParams.bg_color);
    }, []);

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={onMenuClick}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="sm" sx={{ py: 2 }}>
                {children}
            </Container>
        </Box>
    );
};