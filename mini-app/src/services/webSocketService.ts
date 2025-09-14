import type { WebSocketMessage } from '../types/websocket';

export const createWebSocketConnection = (
    url: string,
    onOpen: () => void,
    onMessage: (message: WebSocketMessage) => void,
    onClose: () => void,
    onError: (error: Error) => void
) => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log('WebSocket Connected');
        onOpen();
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            onMessage(message);
        } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket Disconnected');
        onClose();
    };

    ws.onerror = (event) => {
        console.error('WebSocket Error:', event);
        onError(new Error('WebSocket connection error'));
    };

    return ws;
};