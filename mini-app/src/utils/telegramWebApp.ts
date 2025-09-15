import  WebApp  from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface WebAppInitData {
  user?: TelegramUser;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramTheme {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color: string;
  accent_text_color: string;
  section_bg_color: string;
  section_header_text_color: string;
  subtitle_text_color: string;
  destructive_text_color: string;
}

class TelegramWebAppManager {
  private static instance: TelegramWebAppManager;
  private isInitialized = false;
  private initData: WebAppInitData | null = null;

  private constructor() {}

  static getInstance(): TelegramWebAppManager {
    if (!TelegramWebAppManager.instance) {
      TelegramWebAppManager.instance = new TelegramWebAppManager();
    }
    return TelegramWebAppManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Telegram WebApp
      WebApp.ready();
      WebApp.expand();
      WebApp.enableClosingConfirmation();
      
      // Set viewport and colors
      WebApp.setHeaderColor(WebApp.themeParams.header_bg_color || '#2481cc');
      WebApp.setBackgroundColor(WebApp.themeParams.bg_color || '#ffffff');

      // Parse init data
      if (WebApp.initData) {
        this.initData = this.parseInitData(WebApp.initData);
      }

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('Telegram WebApp initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
      throw error;
    }
  }

  private parseInitData(initData: string): WebAppInitData | null {
    try {
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      
      if (userParam) {
        const user = JSON.parse(userParam) as TelegramUser;
        return {
          user,
          chat_type: urlParams.get('chat_type') || undefined,
          chat_instance: urlParams.get('chat_instance') || undefined,
          start_param: urlParams.get('start_param') || undefined,
          auth_date: parseInt(urlParams.get('auth_date') || '0'),
          hash: urlParams.get('hash') || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to parse init data:', error);
      return null;
    }
  }

  private setupEventListeners(): void {
    // Handle back button
    WebApp.onEvent('backButtonClicked', () => {
      window.history.back();
    });

    // Handle viewport changes
    WebApp.onEvent('viewportChanged', () => {
      console.log('Viewport changed:', {
        height: WebApp.viewportHeight,
        stableHeight: WebApp.viewportStableHeight
      });
    });

    // Handle theme changes
    WebApp.onEvent('themeChanged', () => {
      console.log('Theme changed');
      this.updateTheme();
    });
  }

  private updateTheme(): void {
    WebApp.setHeaderColor(WebApp.themeParams.header_bg_color || '#2481cc');
    WebApp.setBackgroundColor(WebApp.themeParams.bg_color || '#ffffff');
    
    // Dispatch custom event for React components to update
    window.dispatchEvent(new CustomEvent('telegramThemeChanged', {
      detail: WebApp.themeParams
    }));
  }

  getUser(): TelegramUser | null {
    return this.initData?.user || null;
  }

  getTheme(): TelegramTheme {
    return WebApp.themeParams as TelegramTheme;
  }

  getInitData(): string {
    return WebApp.initData;
  }

  sendDataToBot(data: any): void {
    try {
      const payload = JSON.stringify(data);
      WebApp.sendData(payload);
    } catch (error) {
      console.error('Failed to send data to bot:', error);
      throw error;
    }
  }

  showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      WebApp.showAlert(message, resolve);
    });
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      WebApp.showConfirm(message, resolve);
    });
  }

  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }): Promise<string | null> {
    return new Promise((resolve) => {
      WebApp.showPopup(params, resolve);
    });
  }

  openLink(url: string, options?: { try_instant_view?: boolean }): void {
    WebApp.openLink(url, options);
  }

  close(): void {
    WebApp.close();
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  // Main button controls
  setMainButton(text: string, onClick: () => void): void {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.show();
    WebApp.MainButton.onClick(onClick);
  }

  hideMainButton(): void {
    WebApp.MainButton.hide();
    WebApp.MainButton.offClick();
  }

  // Back button controls
  showBackButton(onClick?: () => void): void {
    WebApp.BackButton.show();
    if (onClick) {
      WebApp.BackButton.onClick(onClick);
    }
  }

  hideBackButton(): void {
    WebApp.BackButton.hide();
    WebApp.BackButton.offClick();
  }

  // Haptic feedback
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'): void {
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.impactOccurred(style);
    }
  }

  notificationOccurred(type: 'error' | 'success' | 'warning'): void {
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.notificationOccurred(type);
    }
  }

  selectionChanged(): void {
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.selectionChanged();
    }
  }
}

export const telegramWebApp = TelegramWebAppManager.getInstance();