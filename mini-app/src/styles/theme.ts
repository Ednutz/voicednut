import { createTheme } from '@mui/material/styles';

// Use Telegram's theme variables for colors
const telegramColors = {
    bg_color: window.Telegram?.WebApp?.themeParams?.bg_color || '#ffffff',
    text_color: window.Telegram?.WebApp?.themeParams?.text_color || '#000000',
    hint_color: window.Telegram?.WebApp?.themeParams?.hint_color || '#999999',
    link_color: window.Telegram?.WebApp?.themeParams?.link_color || '#2481cc',
    button_color: window.Telegram?.WebApp?.themeParams?.button_color || '#2481cc',
    button_text_color: window.Telegram?.WebApp?.themeParams?.button_text_color || '#ffffff',
    secondary_bg_color: window.Telegram?.WebApp?.themeParams?.secondary_bg_color || '#f1f1f1',
};

export const theme = createTheme({
    palette: {
        mode: window.Telegram?.WebApp?.themeParams?.text_color === '#ffffff' ? 'dark' : 'light',
        primary: {
            main: telegramColors.button_color,
        },
        secondary: {
            main: telegramColors.link_color,
        },
        text: {
            primary: telegramColors.text_color,
            secondary: telegramColors.hint_color,
        },
        background: {
            default: telegramColors.bg_color,
            paper: telegramColors.secondary_bg_color,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: telegramColors.secondary_bg_color,
                    borderRadius: 12,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                },
            },
        },
    },
});