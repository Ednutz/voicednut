'use strict';

/*
 * Configuration for the Telegram bot
 */

require('dotenv').config();
const required = [
  'ADMIN_TELEGRAM_ID', 'ADMIN_TELEGRAM_USERNAME', 'API_URL', 'BOT_TOKEN', 'WEB_APP_URL'
];

// Check for required environment variables
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  admin: {
    userId: process.env.ADMIN_TELEGRAM_ID,
    username: process.env.ADMIN_TELEGRAM_USERNAME
  },
  apiUrl: process.env.API_URL, // Your external voice call API
  botToken: process.env.BOT_TOKEN,

  // Mini App configuration
  webAppUrl: process.env.WEB_APP_URL,
  webAppSecret: process.env.WEB_APP_SECRET || 'your-web-app-secret',
  
  // Bot API server configuration (different from external API)
  botApiPort: process.env.BOT_API_PORT || 3001,
  botApiUrl: process.env.BOT_API_URL || `http://localhost:${process.env.BOT_API_PORT || 3001}`,

  // CORS settings for Mini App
  cors: {
    origins: [
      'https://web.telegram.org',
      process.env.WEB_APP_URL,
      'http://localhost:3000', // For development
      'http://localhost:5173'  // Vite dev server
    ]
  },
  
  features: {
    webApp: process.env.ENABLE_WEBAPP !== 'false',
    autoTranscript: process.env.AUTO_TRANSCRIPT !== 'false',
    adminCommands: process.env.ENABLE_ADMIN_COMMANDS !== 'false'
  },
    
  // API timeouts and retries
  api: {
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.API_MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.API_RETRY_DELAY) || 1000
  }
};
