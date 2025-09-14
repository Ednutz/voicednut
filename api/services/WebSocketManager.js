const WebSocket = require('ws');
const { verifyTelegramWebAppData } = require('../middleware/telegramAuth');

class WebSocketManager {
    constructor(db, functionEngine) {
        this.db = db;
        this.functionEngine = functionEngine;
        this.clients = new Map(); // Map<userId, WebSocket>
        this.activeSubscriptions = new Map(); // Map<userId, Set<eventType>>
    }

    // Handle new WebSocket connection
    async handleConnection(ws, req) {
        try {
            // Verify Telegram WebApp authentication
            const initData = req.query.initData;
            if (!initData) {
                ws.close(4000, 'No authentication data provided');
                return;
            }

            const userData = await verifyTelegramWebAppData(initData);
            if (!userData) {
                ws.close(4001, 'Invalid authentication');
                return;
            }

            // Store client connection
            this.clients.set(userData.id, ws);
            this.activeSubscriptions.set(userData.id, new Set());

            // Send initial state
            await this.sendInitialState(ws, userData.id);

            // Handle incoming messages
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleClientMessage(ws, userData.id, data);
                } catch (error) {
                    console.error('Error handling client message:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Failed to process message'
                    }));
                }
            });

            // Handle client disconnection
            ws.on('close', () => {
                this.clients.delete(userData.id);
                this.activeSubscriptions.delete(userData.id);
            });

            // Send confirmation
            ws.send(JSON.stringify({
                type: 'connected',
                userId: userData.id
            }));

        } catch (error) {
            console.error('WebSocket connection error:', error);
            ws.close(4002, 'Connection initialization failed');
        }
    }

    // Send initial state to client
    async sendInitialState(ws, userId) {
        try {
            // Get user data
            const user = await this.db.getUser(userId);
            if (!user) return;

            // Get recent activity
            const recentCalls = await this.db.getRecentCalls(userId, 5);
            const recentSms = await this.db.getRecentSms(userId, 5);
            
            // Get statistics
            const stats = await this.db.getUserStats(userId);

            ws.send(JSON.stringify({
                type: 'initial_state',
                data: {
                    user,
                    recentActivity: {
                        calls: recentCalls,
                        sms: recentSms
                    },
                    stats
                }
            }));
        } catch (error) {
            console.error('Error sending initial state:', error);
        }
    }

    // Handle messages from clients
    async handleClientMessage(ws, userId, message) {
        switch (message.type) {
            case 'subscribe':
                this.handleSubscription(userId, message.events);
                break;

            case 'unsubscribe':
                this.handleUnsubscription(userId, message.events);
                break;

            case 'call_request':
                await this.handleCallRequest(ws, userId, message.data);
                break;

            case 'sms_request':
                await this.handleSmsRequest(ws, userId, message.data);
                break;

            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Unknown message type'
                }));
        }
    }

    // Handle event subscriptions
    handleSubscription(userId, events) {
        const subscriptions = this.activeSubscriptions.get(userId);
        if (subscriptions) {
            events.forEach(event => subscriptions.add(event));
        }
    }

    // Handle event unsubscriptions
    handleUnsubscription(userId, events) {
        const subscriptions = this.activeSubscriptions.get(userId);
        if (subscriptions) {
            events.forEach(event => subscriptions.delete(event));
        }
    }

    // Broadcast event to subscribed clients
    broadcastEvent(eventType, data, targetUserIds = null) {
        this.clients.forEach((ws, userId) => {
            // Check if client should receive this event
            if (targetUserIds && !targetUserIds.includes(userId)) return;
            
            // Check if client is subscribed to this event type
            const subscriptions = this.activeSubscriptions.get(userId);
            if (!subscriptions || !subscriptions.has(eventType)) return;

            ws.send(JSON.stringify({
                type: eventType,
                data
            }));
        });
    }

    // Handle call requests
    async handleCallRequest(ws, userId, data) {
        try {
            // Validate request
            if (!data.phone || !data.prompt || !data.first_message) {
                throw new Error('Missing required fields');
            }

            // Check user permissions
            const user = await this.db.getUser(userId);
            if (!user || !user.active) {
                throw new Error('Unauthorized');
            }

            // Initialize call
            const callId = await this.functionEngine.initializeCall({
                userId,
                phone: data.phone,
                prompt: data.prompt,
                firstMessage: data.first_message
            });

            ws.send(JSON.stringify({
                type: 'call_initiated',
                data: { callId }
            }));

        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                error: error.message
            }));
        }
    }

    // Handle SMS requests
    async handleSmsRequest(ws, userId, data) {
        try {
            // Validate request
            if (!data.phone || !data.message) {
                throw new Error('Missing required fields');
            }

            // Check user permissions
            const user = await this.db.getUser(userId);
            if (!user || !user.active) {
                throw new Error('Unauthorized');
            }

            // Send SMS
            const smsId = await this.functionEngine.sendSms({
                userId,
                phone: data.phone,
                message: data.message
            });

            ws.send(JSON.stringify({
                type: 'sms_sent',
                data: { smsId }
            }));

        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                error: error.message
            }));
        }
    }
}

module.exports = WebSocketManager;