# VoicedNut Mini App

A Telegram Mini App for VoicedNut, providing easy access to calling, SMS, and transcript management features.

## Features

- 📞 Make Voice Calls
- 💬 Send SMS Messages
- 👥 User Management
- 📝 View Call Transcripts
- 🎨 Telegram Theme Integration

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:

   ```
   VITE_API_URL=http://your-api-url
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:

   ```bash
   ./deploy.sh
   ```

3. Update the bot's configuration with the new Vercel URL.

## Bot Integration

1. Set up the mini app in BotFather:

   - Use `/mybots` command
   - Select your bot
   - Go to Bot Settings > Menu Button
   - Set the Web App URL to your deployed Vercel URL

2. Update the bot's environment variables:
   ```
   WEBAPP_URL=https://your-vercel-url
   ```

## Features

### Calling

- Initiate voice calls
- Real-time call status tracking
- End active calls

### SMS

- Send SMS messages
- E.164 phone number validation
- Character count tracking

### User Management

- View user list
- Add new users
- Remove users
- Promote users to admin

### Transcripts

- View call transcripts
- Sentiment analysis
- Call summaries
- Search and filter options

## Theme Integration

The app automatically adapts to Telegram's theme colors for a native look and feel:

- Light/Dark mode support
- Custom color schemes
- Native UI components
