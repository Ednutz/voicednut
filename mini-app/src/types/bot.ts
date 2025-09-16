export interface BotResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

export interface UserData {
  id?: number;
  telegram_id: number;
  username: string;
  role: 'ADMIN' | 'USER';
  timestamp: string;
}

export interface CallData {
  call_sid: string;
  phone_number: string;
  status: string;
  created_at: string;
  duration?: number;
  transcript_count?: number;
  to?: string;
  from?: string;
}

export interface SMSData {
  message_sid: string;
  to: string;
  from?: string;
  body: string;
  status: string;
  created_at: string;
}

export interface StatsData {
  total_calls: number;
  total_sms: number;
  error?: string;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CallTranscript {
  call_sid: string;
  messages: TranscriptMessage[];
  duration: number;
  status: string;
}
