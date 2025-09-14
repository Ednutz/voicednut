# VoicedNut AI Development Guidelines

This project is a voice-based AI system that integrates Twilio, OpenAI/OpenRouter, and Deepgram to enable natural conversations over phone calls. Here's what you need to know to contribute effectively:

## Core Architecture

### Service Boundaries

- `api/`: Express backend handling calls, AI, webhooks
  - Core integration endpoints in `routes/` (Twilio, OpenAI, Deepgram)
  - Business logic in `functions/` with dynamic engine pattern
  - SQLite storage in `db/` for state and history
- `bot/`: Telegram interface with embedded React mini-app
  - Command handlers in `commands/` using Grammy.js
  - React app in `mini-app/` for rich UI features

### Key Data Flows

1. Inbound Voice: `routes/stream.js` → Deepgram → `routes/transcription.js` → OpenAI → `routes/tts.js`
2. Outbound Voice: `bot/commands/call.js` → `api/routes/stream.js` → Twilio
3. UI Updates: `bot/mini-app/src` ↔ WebSocket ↔ `bot/server/webapp.js`

## Critical Patterns

### Dynamic Function System (`functions/DynamicFunctionEngine.js`)

The system uses a template-based function registration pattern for all business logic:

```javascript
functionTemplates.set('inventory_check', {
  name: 'checkInventory',
  description: '...',
  parameters: {...},
  implementation: this.createInventoryFunction.bind(this)
});
```

### Personality Engine (`functions/PersonalityEngine.js`)

- Response generation MUST include '•' markers every 5-10 words for TTS chunking
- Personalities defined in constructor with profiles (tone, pace, formality)
- Context tracked via `conversationContext` object properties:
  - customerMood
  - communicationStyle
  - urgencyLevel
  - techSavviness
  - responsePatterns

### Testing Approach

Each business function must have corresponding test files in `test/` with these conventions:

- Simple input/output assertions
- Multiple test cases per function
- Clear test descriptions
- JSON string outputs

Example:

```javascript
test("Expect Airpods Pro to have 10 units", () => {
  expect(checkInventory({ model: "airpods pro" })).toBe('{"stock":10}');
});
```

## Development Setup

### Required Environment

```
SERVER=your-domain.com
OPENAI_API_KEY=sk-xxx
DEEPGRAM_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
OPENROUTER_API_KEY=xxx (optional)
OPENROUTER_MODEL=xxx (optional)
```

### Local Development

1. Run ngrok for Twilio webhook forwarding
2. Obtain API keys (OpenAI/OpenRouter, Deepgram)
3. Use SQLite for local database
4. Run both services:
   ```bash
   # Terminal 1
   cd api && npm start
   # Terminal 2
   cd bot && npm start
   ```

## Common Workflows

### Add New Business Function

1. Add template to `DynamicFunctionEngine.js`
2. Implement in `functions/` following template pattern
3. Add test case in `test/` matching existing format
4. Update schema in `db/db.js` if needed

### Modify AI Behavior

- Update system prompts in `routes/gpt.js`
- Adjust personality profiles in `PersonalityEngine.js`
- Maintain TTS markers (•) in all responses

### Work with Mini-app

- UI components in `bot/mini-app/src/components`
- WebSocket handling in `hooks/useWebSocket.ts`
- Routes defined in `navigation/routes.tsx`
