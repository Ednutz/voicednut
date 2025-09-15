import { createTheme, Theme } from '@mui/material/styles';
import { telegramWebApp, TelegramTheme } from '../utils/telegramWebApp';

interface TelegramMUITheme extends Theme {
  telegram: TelegramTheme;
}

const createTelegramTheme = (): TelegramMUITheme => {
  const telegramTheme = telegramWebApp.getTheme();
  
  // Determine if we're in dark mode
  const isDarkMode = telegramTheme.bg_color === '#212121' || 
                     telegramTheme.bg_color === '#0f0f0f' ||
                     telegramTheme.bg_color === '#1c1c1d' ||
                     parseInt(telegramTheme.bg_color.slice(1), 16) < 0x808080;

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: telegramTheme.button_color || '#2481cc',
        contrastText: telegramTheme.button_text_color || '#ffffff',
      },
      secondary: {
        main: telegramTheme.link_color || '#2481cc',
      },
      background: {
        default: telegramTheme.bg_color || '#ffffff',
        paper: telegramTheme.secondary_bg_color || (isDarkMode ? '#2c2c2e' : '#f2f2f7'),
      },
      text: {
        primary: telegramTheme.text_color || (isDarkMode ? '#ffffff' : '#000000'),
        secondary: telegramTheme.hint_color || (isDarkMode ? '#8e8e93' : '#8e8e93'),
      },
      divider: telegramTheme.section_bg_color || (isDarkMode ? '#38383a' : '#c6c6c8'),
      error: {
        main: telegramTheme.destructive_text_color || '#ff3b30',
      },
      info: {
        main: telegramTheme.link_color || '#007aff',
      },
      success: {
        main: '#34c759',
      },
      warning: {
        main: '#ff9500',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
      button: {
        fontSize: '1rem',
        fontWeight: 500,
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.33,
        color: telegramTheme.hint_color || (isDarkMode ? '#8e8e93' : '#8e8e93'),
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: telegramTheme.bg_color || '#ffffff',
            color: telegramTheme.text_color || '#000000',
            fontFamily: [
              '-apple-system',
              'BlinkMacSystemFont',
              '"Segoe UI"',
              'Roboto',
              '"Helvetica Neue"',
              'Arial',
              'sans-serif',
            ].join(','),
          },
          '*': {
            boxSizing: 'border-box',
          },
          '*, *::before, *::after': {
            boxSizing: 'inherit',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: telegramTheme.header_bg_color || telegramTheme.secondary_bg_color,
            color: telegramTheme.text_color,
            boxShadow: 'none',
            borderBottom: `1px solid ${telegramTheme.section_bg_color || (isDarkMode ? '#38383a' : '#c6c6c8')}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: telegramTheme.secondary_bg_color || (isDarkMode ? '#2c2c2e' : '#ffffff'),
            borderRadius: 16,
            border: `1px solid ${telegramTheme.section_bg_color || (isDarkMode ? '#38383a' : '#c6c6c8')}`,
            boxShadow: isDarkMode 
              ? '0px 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0px 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDarkMode 
                ? '0px 4px 16px rgba(0, 0, 0, 0.4)' 
                : '0px 4px 16px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            backgroundColor: telegramTheme.button_color,
            color: telegramTheme.button_text_color,
            '&:hover': {
              backgroundColor: telegramTheme.button_color,
              filter: 'brightness(0.9)',
            },
            '&:disabled': {
              backgroundColor: telegramTheme.hint_color,
              color: telegramTheme.button_text_color,
              opacity: 0.6,
            },
          },
          outlined: {
            borderColor: telegramTheme.button_color,
            color: telegramTheme.button_color,
            '&:hover': {
              borderColor: telegramTheme.button_color,
              backgroundColor: `${telegramTheme.button_color}15`,
            },
          },
          text: {
            color: telegramTheme.link_color,
            '&:hover': {
              backgroundColor: `${telegramTheme.link_color}15`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: telegramTheme.bg_color,
              borderRadius: 12,
              '& fieldset': {
                borderColor: telegramTheme.section_bg_color || (isDarkMode ? '#38383a' : '#c6c6c8'),
              },
              '&:hover fieldset': {
                borderColor: telegramTheme.link_color,
              },
              '&.Mui-focused fieldset': {
                borderColor: telegramTheme.button_color,
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: telegramTheme.hint_color,
              '&.Mui-focused': {
                color: telegramTheme.button_color,
              },
            },
            '& .MuiInputBase-input': {
              color: telegramTheme.text_color,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: telegramTheme.secondary_bg_color,
            color: telegramTheme.text_color,
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: telegramTheme.secondary_bg_color,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '2px 8px',
            '&:hover': {
              backgroundColor: `${telegramTheme.button_color}15`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
          filled: {
            backgroundColor: telegramTheme.button_color,
            color: telegramTheme.button_text_color,
          },
          outlined: {
            borderColor: telegramTheme.button_color,
            color: telegramTheme.button_color,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: telegramTheme.secondary_bg_color,
            borderRadius: 16,
            border: `1px solid ${telegramTheme.section_bg_color || (isDarkMode ? '#38383a' : '#c6c6c8')}`,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: telegramTheme.text_color,
            fontWeight: 600,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            color: telegramTheme.text_color,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: `${telegramTheme.button_color}15`,
              transform: 'scale(1.05)',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: 'none',
          },
          standardError: {
            backgroundColor: `${telegramTheme.destructive_text_color}15`,
            color: telegramTheme.destructive_text_color,
          },
          standardWarning: {
            backgroundColor: '#ff950015',
            color: '#ff9500',
          },
          standardInfo: {
            backgroundColor: `${telegramTheme.link_color}15`,
            color: telegramTheme.link_color,
          },
          standardSuccess: {
            backgroundColor: '#34c75915',
            color: '#34c759',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: telegramTheme.section_bg_color,
          },
          bar: {
            backgroundColor: telegramTheme.button_color,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: telegramTheme.button_color,
          },
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    spacing: 8,
  });

  // Add Telegram theme to the MUI theme
  return {
    ...theme,
    telegram: telegramTheme,
  } as TelegramMUITheme;
};

export { createTelegramTheme };
export type { TelegramMUITheme };