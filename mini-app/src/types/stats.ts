export interface UserStats {
    total_calls: number;
    total_sms: number;
    this_month_calls: number;
    this_month_sms: number;
    success_rate: number;
    last_activity: string;
    call_trend?: {
        value: number;
        isPositive: boolean;
    };
    sms_trend?: {
        value: number;
        isPositive: boolean;
    };
}

export interface CallFormData {
    phone: string;
    prompt: string;
    first_message: string;
}

export interface ApiResponse {
    success: boolean;
    error?: string;
}