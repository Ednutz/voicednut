import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { telegramWebApp } from '../utils/telegramWebApp';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CallData {
  phone: string;
  prompt: string;
  first_message: string;
}

export interface SMSData {
  phone: string;
  message: string;
}

export interface User {
  id: number;
  telegram_id: number;
  username: string;
  role: 'USER' | 'ADMIN';
  timestamp: string;
}

export interface Call {
  call_sid: string;
  phone_number: string;
  status: string;
  duration?: number;
  created_at: string;
  transcript_count?: number;
  call_summary?: string;
}

export interface Transcript {
  id: string;
  call_sid: string;
  speaker: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add Telegram init data
    this.api.interceptors.request.use(
      (config) => {
        const initData = telegramWebApp.getInitData();
        if (initData) {
          config.headers['X-Telegram-Init-Data'] = initData;
        }

        const user = telegramWebApp.getUser();
        if (user) {
          config.headers['X-Telegram-User-ID'] = user.id.toString();
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          telegramWebApp.showAlert('Authentication failed. Please restart the app.');
        } else if (error.response?.status === 403) {
          telegramWebApp.showAlert('You do not have permission to perform this action.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Call-related methods
  async initiateCall(data: CallData): Promise<ApiResponse<{ call_sid: string; status: string; to: string }>> {
    try {
      const user = telegramWebApp.getUser();
      const payload = {
        ...data,
        user_chat_id: user?.id?.toString() || '',
        number: data.phone,
        prompt: data.prompt,
        first_message: data.first_message
      };

      const response = await this.api.post('/outbound-call', payload);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to initiate call'
      };
    }
  }

  async getCallStatus(callSid: string): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await this.api.get(`/call-status/${callSid}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get call status'
      };
    }
  }

  async endCall(callSid: string): Promise<ApiResponse> {
    try {
      await this.api.post(`/end-call/${callSid}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to end call'
      };
    }
  }

  async getCalls(limit = 10): Promise<ApiResponse<Call[]>> {
    try {
      const response = await this.api.get(`/api/calls?limit=${limit}`);
      return {
        success: true,
        data: response.data.calls || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch calls'
      };
    }
  }

  async getCallTranscript(callSid: string): Promise<ApiResponse<{ call: Call; transcripts: Transcript[] }>> {
    try {
      const response = await this.api.get(`/api/calls/${callSid}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch transcript'
      };
    }
  }

  // SMS-related methods
  async sendSMS(data: SMSData): Promise<ApiResponse<{ message_sid: string }>> {
    try {
      const user = telegramWebApp.getUser();
      const payload = {
        ...data,
        user_chat_id: user?.id?.toString() || '',
        number: data.phone,
        body: data.message
      };

      const response = await this.api.post('/send-sms', payload);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send SMS'
      };
    }
  }

  // User management methods
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.api.get('/api/users');
      return {
        success: true,
        data: response.data.users || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  }

  async addUser(telegramId: number, username: string): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.post('/api/users', {
        telegram_id: telegramId,
        username: username,
        role: 'USER'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add user'
      };
    }
  }

  async removeUser(telegramId: number): Promise<ApiResponse> {
    try {
      await this.api.delete(`/api/users/${telegramId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove user'
      };
    }
  }

  async promoteUser(telegramId: number): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.patch(`/api/users/${telegramId}/promote`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to promote user'
      };
    }
  }

  async checkUserAuthorization(): Promise<ApiResponse<{ authorized: boolean; isAdmin: boolean }>> {
    try {
      const response = await this.api.get('/api/auth/check');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to check authorization'
      };
    }
  }

  // Bot communication methods
  async sendDataToBot(action: string, data: any = {}): Promise<void> {
    try {
      const user = telegramWebApp.getUser();
      const payload = {
        action,
        user_id: user?.id,
        timestamp: Date.now(),
        ...data
      };

      telegramWebApp.sendDataToBot(payload);
    } catch (error) {
      console.error('Failed to send data to bot:', error);
      throw error;
    }
  }

  // Utility methods
  isValidPhoneNumber(phone: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone.trim());
  }

  formatPhoneNumber(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }
}

export const apiService = new ApiService();