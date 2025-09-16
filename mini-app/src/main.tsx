import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Initialize Telegram WebApp
const initTelegramApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;

    // Basic initialization
    tg.ready();
    tg.expand();

    // Set up theme
    document.documentElement.style.setProperty(
      '--tg-bg-color',
      tg.themeParams.bg_color || '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--tg-text-color',
      tg.themeParams.text_color || '#000000'
    );
    document.documentElement.style.setProperty(
      '--tg-hint-color',
      tg.themeParams.hint_color || '#708499'
    );
    document.documentElement.style.setProperty(
      '--tg-link-color',
      tg.themeParams.link_color || '#2481cc'
    );
    document.documentElement.style.setProperty(
      '--tg-button-color',
      tg.themeParams.button_color || '#2481cc'
    );
    document.documentElement.style.setProperty(
      '--tg-button-text-color',
      tg.themeParams.button_text_color || '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--tg-secondary-bg-color',
      tg.themeParams.secondary_bg_color || '#f1f3f4'
    );

    // Apply color scheme
    document.body.className = `theme-${tg.colorScheme}`;

    console.log('Telegram WebApp initialized:', {
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      user: tg.initDataUnsafe.user
    });
  } else {
    console.warn('Telegram WebApp not available - running in development mode');

    // Development fallback
    document.body.className = 'theme-light';
  }
};

// Initialize app
initTelegramApp();

// Remove initial loading spinner
const loadingElement = document.querySelector('.initial-loading');
if (loadingElement) {
  loadingElement.remove();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
