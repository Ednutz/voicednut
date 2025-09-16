import { BotResponse, CallData, UserData, StatsData } from '../types/bot';

class BotApiService {
  private baseUrl: string;
  private chatId: string | null = null;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BOT_API_URL || 'http://localhost:3000';
    this.initializeTelegram();
  }

  private initializeTelegram() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      this.chatId = tg.initDataUnsafe?.user?.id?.toString() || null;
      this.authToken = tg.initData;

      // Configure Telegram WebApp
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BotResponse<T>> {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.chatId || '',
      Authorization: `tg-webapp ${this.authToken || ''}`,
      ...options.headers
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send data to bot (this integrates with your webAppHandler.js)
  async sendToBotHandler(action: string, data: any, requestId?: string) {
    if (!window.Telegram?.WebApp) {
      throw new Error('Telegram WebApp not available');
    }

    const payload = {
      action,
      requestId: requestId || Date.now().toString(),
      ...data
    };

    try {
      window.Telegram.WebApp.sendData(JSON.stringify(payload));
      return { success: true, requestId: payload.requestId };
    } catch (error) {
      console.error('Failed to send data to bot:', error);
      throw error;
    }
  }

  // Authentication methods
  async checkAuth(): Promise<
    BotResponse<{ authorized: boolean; isAdmin: boolean; user: UserData | null }>
  > {
    return this.sendToBotHandler('checkAuth', {});
  }

  // Call management
  async getCalls(limit = 10): Promise<BotResponse<CallData[]>> {
    return this.makeRequest<CallData[]>(`/api/calls/list?limit=${limit}`);
  }

  async getTranscript(callSid: string): Promise<BotResponse<any>> {
    return this.makeRequest(`/api/calls/${callSid}`);
  }

  async initiateCall(
    phone: string,
    prompt: string,
    firstMessage: string
  ): Promise<BotResponse<any>> {
    return this.sendToBotHandler('initiateCall', {
      phone,
      prompt,
      first_message: firstMessage
    });
  }

  // SMS management
  async sendSMS(phone: string, message: string): Promise<BotResponse<any>> {
    return this.sendToBotHandler('sendSMS', {
      phone,
      message
    });
  }

  // Admin functions
  async getUsers(): Promise<BotResponse<UserData[]>> {
    return this.sendToBotHandler('getUsers', {});
  }

  async addUser(telegramId: string, username: string): Promise<BotResponse<UserData>> {
    return this.sendToBotHandler('addUser', {
      telegramId,
      username
    });
  }

  async removeUser(telegramId: string): Promise<BotResponse<any>> {
    return this.sendToBotHandler('removeUser', {
      telegramId
    });
  }

  async promoteUser(telegramId: string): Promise<BotResponse<any>> {
    return this.sendToBotHandler('promoteUser', {
      telegramId
    });
  }

  // Statistics
  async getStats(): Promise<BotResponse<StatsData>> {
    return this.sendToBotHandler('getStats', {});
  }

  async getActivity(limit = 10): Promise<BotResponse<any[]>> {
    return this.sendToBotHandler('getActivity', { limit });
  }

  // Health check
  async ping(): Promise<BotResponse<{ message: string; timestamp: number }>> {
    return this.sendToBotHandler('ping', {});
  }
}

const botApi = new BotApiService();
export { botApi };
export default botApi;
