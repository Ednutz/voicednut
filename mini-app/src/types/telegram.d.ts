interface TelegramThemeParams {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
}

interface TelegramWebApp {
    themeParams: TelegramThemeParams;
    platform: string;
    colorScheme: 'light' | 'dark';
    backgroundColor: string;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    ready(): void;
    expand(): void;
    close(): void;
}

interface Telegram {
    WebApp: TelegramWebApp;
}

interface Window {
    Telegram?: Telegram;
}