/**
 * Shared event type definitions for WebSocket communication between bot and mini-app
 */

// Call Events
export interface CallInitiatedEvent {
    userId: number;
    phone: string;
    prompt: string;
    callId: string;
}

export interface CallStatusEvent {
    userId: number;
    callId: string;
    status: 'queued' | 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed';
    timestamp: number;
}

export interface TranscriptionEvent {
    callId: string;
    text: string;
    isFinal: boolean;
}

// API Events
export interface APIHealthEvent {
    status: string;
    active_calls: number;
    services: {
        database: {
            connected: boolean;
            recent_calls: number;
        };
        webhook_service: {
            status: string;
        };
    };
}

// Dashboard Events
export interface DashboardStatsEvent {
    callMetrics: {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        averageDuration: number;
        callsByHour: Array<{ hour: number; count: number }>;
        callsByDay: Array<{ date: string; count: number }>;
    };
    voiceMetrics: {
        quality: {
            excellent: number;
            good: number;
            fair: number;
            poor: number;
        };
        latency: number[];
        packetLoss: number[];
    };
}

// Utility type for event payloads
export type EventPayload =
    | { type: 'call_initiated'; data: CallInitiatedEvent }
    | { type: 'call_status'; data: CallStatusEvent }
    | { type: 'transcription'; data: TranscriptionEvent }
    | { type: 'api_health'; data: APIHealthEvent }
    | { type: 'dashboard_stats'; data: DashboardStatsEvent };