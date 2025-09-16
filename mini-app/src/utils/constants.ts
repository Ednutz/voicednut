export const APP_CONFIG = {
  name: 'VoicedNut',
  version: '2.0.0',
  description: 'AI-Powered Voice Call & SMS Management',
  author: 'VoicedNut Team'
};

export const API_ENDPOINTS = {
  health: '/health',
  calls: '/api/calls',
  callsList: '/api/calls/list',
  callTranscript: '/api/calls/:callSid',
  outboundCall: '/outbound-call',
  sendSms: '/send-sms',
  userStats: '/user-stats/:userId'
};

export const VALIDATION_RULES = {
  phone: {
    required: { type: 'required' as const, message: 'Phone number is required' },
    format: {
      type: 'phone' as const,
      message: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
    }
  },
  prompt: {
    required: { type: 'required' as const, message: 'AI prompt is required' },
    minLength: {
      type: 'minLength' as const,
      value: 20,
      message: 'AI prompt should be at least 20 characters for better results'
    }
  },
  firstMessage: {
    required: { type: 'required' as const, message: 'First message is required' },
    minLength: {
      type: 'minLength' as const,
      value: 10,
      message: 'First message should be at least 10 characters'
    }
  },
  smsMessage: {
    required: { type: 'required' as const, message: 'Message is required' },
    maxLength: {
      type: 'maxLength' as const,
      value: 1600,
      message: 'Message too long (max 1600 characters)'
    }
  },
  telegramId: {
    required: { type: 'required' as const, message: 'Telegram ID is required' },
    format: { type: 'telegramId' as const, message: 'Invalid Telegram ID format' }
  },
  username: {
    required: { type: 'required' as const, message: 'Username is required' },
    format: {
      type: 'username' as const,
      message: 'Invalid username format (3-32 characters, letters, numbers, underscores only)'
    }
  }
};

export const UI_CONFIG = {
  animation: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 50
  },
  polling: {
    statsInterval: 30000, // 30 seconds
    callsInterval: 10000 // 10 seconds
  }
};

export const CALL_TEMPLATES = [
  {
    name: 'Customer Service',
    icon: '📞',
    prompt:
      'You are a professional customer service representative. Be polite, helpful, and concise. Always ask how you can assist and listen carefully to customer concerns.',
    firstMessage: 'Hello! This is customer service calling. How can I assist you today?'
  },
  {
    name: 'Survey',
    icon: '📊',
    prompt:
      'You are conducting a friendly survey. Ask questions politely, be patient with responses, and thank the person for their time. Keep questions brief and clear.',
    firstMessage:
      "Hi! We're conducting a quick survey and would appreciate your feedback. Do you have a moment to answer a few questions?"
  },
  {
    name: 'Appointment Reminder',
    icon: '📅',
    prompt:
      'You are making an appointment reminder call. Be professional and helpful with scheduling. Confirm details and offer rescheduling options if needed.',
    firstMessage:
      'Hello! This is a friendly reminder about your upcoming appointment. Are you still able to make it as scheduled?'
  },
  {
    name: 'Sales Call',
    icon: '💼',
    prompt:
      "You are a professional sales representative. Be friendly but respectful, don't be pushy, and focus on understanding customer needs first.",
    firstMessage:
      "Hi! I hope you're having a great day. I'm calling to tell you about an exciting opportunity that might interest you."
  },
  {
    name: 'Follow-up',
    icon: '📞',
    prompt:
      'You are making a follow-up call. Be warm and personal, reference previous interactions, and ensure customer satisfaction.',
    firstMessage:
      "Hello! I'm following up on our previous conversation. I wanted to see how everything is going and if you have any questions."
  }
];

export const SMS_TEMPLATES = [
  {
    name: 'Welcome',
    message:
      "Welcome to VoicedNut! We're excited to have you on board. If you have any questions, feel free to reach out."
  },
  {
    name: 'Reminder',
    message:
      'This is a friendly reminder about your upcoming appointment on [DATE] at [TIME]. Please reply to confirm.'
  },
  {
    name: 'Thank You',
    message:
      'Thank you for your business! We appreciate your trust in our services. Have a great day!'
  },
  {
    name: 'Support',
    message:
      'Our support team is here to help! Contact us at [PHONE] or reply to this message for assistance.'
  }
];

export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection and try again.',
  unauthorized: 'You are not authorized to perform this action.',
  server: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  unknown: 'An unexpected error occurred. Please try again.'
};

export const SUCCESS_MESSAGES = {
  callInitiated:
    "Call initiated successfully! You'll receive notifications about the call progress.",
  smsSent: 'SMS sent successfully!',
  userAdded: 'User added successfully!',
  userRemoved: 'User removed successfully!',
  userPromoted: 'User promoted to admin successfully!',
  dataRefreshed: 'Data refreshed successfully!'
};
