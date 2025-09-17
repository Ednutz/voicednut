const { getUser, isAdmin, getUserList, addUser, promoteUser, removeUser } = require('../db/db');
const { InlineKeyboard } = require('grammy');
const config = require('../config');
const axios = require('axios');

class WebAppHandler {
    constructor(bot) {
        this.bot = bot;
        this.setupWebAppHandlers();
    }

    setupWebAppHandlers() {
        // Handle web app data - this is the main handler for Mini App communication
        this.bot.on('message:web_app_data', async (ctx) => {
            try {
                const data = JSON.parse(ctx.message.web_app_data.data);
                console.log('WebApp data received from user', ctx.from.id, ':', data);

                await this.handleWebAppAction(ctx, data);
            } catch (error) {
                console.error('Error handling web app data:', error);
                await ctx.reply('❌ An error occurred while processing your Mini App request.');
            }
        });

        // Handle callback queries that start with 'webapp:'
        this.bot.on('callback_query:data', async (ctx) => {
            if (ctx.callbackQuery.data?.startsWith('webapp:')) {
                const action = ctx.callbackQuery.data.replace('webapp:', '');
                await this.handleWebAppCallback(ctx, action);
            }
        });

        // Add a command to test webapp connection
        this.bot.command('webapptest', async (ctx) => {
            try {
                const user = await new Promise(resolve => getUser(ctx.from.id, resolve));
                if (!user) {
                    return ctx.reply('❌ You are not authorized to use this bot.');
                }

                const testData = {
                    action: 'ping',
                    timestamp: Date.now(),
                    user_id: ctx.from.id
                };

                await ctx.reply(
                    '🧪 *WebApp Connection Test*\n\n' +
                    'This test will help verify Mini App integration.\n\n' +
                    `Test Data: \`${JSON.stringify(testData)}\`\n\n` +
                    'Use the Mini App to send this test data back.',
                    { parse_mode: 'Markdown' }
                );

            } catch (error) {
                console.error('WebApp test error:', error);
                await ctx.reply('❌ Error running WebApp test.');
            }
        });
    }

    async handleWebAppAction(ctx, data) {
        const { action, requestId, ...params } = data;
        const userId = ctx.from.id;

        try {
            // Check if user is authorized
            const user = await new Promise(resolve => getUser(userId, resolve));
            if (!user) {
                return this.sendNotification(ctx, {
                    success: false,
                    error: 'User not authorized',
                    requestId
                });
            }

            let response;

            switch (action) {
                case 'ping':
                    response = { success: true, data: { message: 'pong', timestamp: Date.now() } };
                    break;

                case 'checkAuth':
                    response = await this.handleCheckAuth(userId);
                    break;

                case 'getUsers':
                    response = await this.handleGetUsers(userId);
                    break;

                case 'addUser':
                    response = await this.handleAddUser(userId, params);
                    break;

                case 'removeUser':
                    response = await this.handleRemoveUser(userId, params);
                    break;

                case 'promoteUser':
                    response = await this.handlePromoteUser(userId, params);
                    break;

                case 'getCalls':
                    response = await this.handleGetCalls(userId, params);
                    break;

                case 'getTranscript':
                    response = await this.handleGetTranscript(userId, params);
                    break;

                case 'initiateCall':
                    response = await this.handleInitiateCall(userId, params);
                    break;

                case 'sendSMS':
                    response = await this.handleSendSMS(userId, params);
                    break;
                case 'healthCheck':
                    response = await this.handleWebAppHealthCheck();
                    break;
                case 'getStats':
                    response = await this.handleGetStats(userId);
                    break;

                case 'getActivity':
                    response = await this.handleGetActivity(userId, params);
                    break;

                default:
                    response = {
                        success: false,
                        error: `Unknown action: ${action}`
                    };
            }

            // Send notification to user about the action result
            await this.sendNotification(ctx, { ...response, action, requestId });

        } catch (error) {
            console.error(`Error handling WebApp action ${action}:`, error);
            await this.sendNotification(ctx, {
                success: false,
                error: error.message,
                action,
                requestId
            });
        }
    }

    async handleCheckAuth(userId) {
        try {
            const user = await new Promise(resolve => getUser(userId, resolve));
            const adminStatus = user ? await new Promise(resolve => isAdmin(userId, resolve)) : false;

            return {
                success: true,
                data: {
                    authorized: !!user,
                    isAdmin: adminStatus,
                    user: user ? {
                        id: user.telegram_id,
                        username: user.username,
                        role: user.role,
                        timestamp: user.timestamp
                    } : null
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to check authorization'
            };
        }
    }

    async handleGetUsers(userId) {
        try {
            // Check if user is admin
            const adminStatus = await new Promise(resolve => isAdmin(userId, resolve));
            if (!adminStatus) {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            const users = await new Promise(resolve => {
                getUserList((err, result) => {
                    resolve(err ? [] : result);
                });
            });

            return {
                success: true,
                data: users.map(user => ({
                    id: user.id,
                    telegram_id: user.telegram_id,
                    username: user.username,
                    role: user.role,
                    timestamp: user.timestamp
                }))
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get users'
            };
        }
    }

    async handleAddUser(userId, data) {
        try {
            // Check if user is admin
            const adminStatus = await new Promise(resolve => isAdmin(userId, resolve));
            if (!adminStatus) {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            const { telegramId, username } = data;
            if (!telegramId || !username) {
                return {
                    success: false,
                    error: 'Telegram ID and username are required'
                };
            }

            await new Promise((resolve, reject) => {
                addUser(telegramId, username, 'USER', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return {
                success: true,
                data: {
                    telegram_id: telegramId,
                    username: username,
                    role: 'USER'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to add user: ${error.message}`
            };
        }
    }

    async handleRemoveUser(userId, data) {
        try {
            // Check if user is admin
            const adminStatus = await new Promise(resolve => isAdmin(userId, resolve));
            if (!adminStatus) {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            const { telegramId } = data;
            if (!telegramId) {
                return {
                    success: false,
                    error: 'Telegram ID is required'
                };
            }

            // Prevent admin from removing themselves
            if (telegramId.toString() === userId.toString()) {
                return {
                    success: false,
                    error: 'Cannot remove yourself'
                };
            }

            await new Promise((resolve, reject) => {
                removeUser(telegramId, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return {
                success: true,
                data: { telegram_id: telegramId }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to remove user: ${error.message}`
            };
        }
    }

    async handlePromoteUser(userId, data) {
        try {
            // Check if user is admin
            const adminStatus = await new Promise(resolve => isAdmin(userId, resolve));
            if (!adminStatus) {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            const { telegramId } = data;
            if (!telegramId) {
                return {
                    success: false,
                    error: 'Telegram ID is required'
                };
            }

            await new Promise((resolve, reject) => {
                promoteUser(telegramId, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return {
                success: true,
                data: {
                    telegram_id: telegramId,
                    role: 'ADMIN'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to promote user: ${error.message}`
            };
        }
    }

    async handleGetCalls(userId, data) {
        try {
            const { limit = 10 } = data;

            const endpoints = [
                `${config.apiUrl}/api/calls/list?limit=${limit}`,
                `${config.apiUrl}/api/calls?limit=${limit}`
            ];

            let response;
            let error;

            for (const endpoint of endpoints) {
                try {
                    response = await axios.get(endpoint, {
                        timeout: 15000,
                        headers: {
                            'X-User-ID': userId.toString(),
                            'Accept': 'application/json'
                        }
                    });
                    break;
                } catch (err) {
                    error = err;
                    continue;
                }
            }

            if (!response) {
                throw error || new Error('All endpoints failed');
            }

            return {
                success: true,
                data: response.data.calls || response.data || []
            };
        } catch (error) {
            console.error('Error fetching calls:', error);
            return {
                success: false,
                error: 'Failed to fetch calls'
            };
        }
    }

    async handleGetTranscript(userId, data) {
        try {
            const { callSid } = data;
            if (!callSid) {
                return {
                    success: false,
                    error: 'Call SID is required'
                };
            }

            const response = await axios.get(`${config.apiUrl}/api/calls/${callSid}`, {
                timeout: 15000,
                headers: {
                    'X-User-ID': userId.toString()
                }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching transcript:', error);
            return {
                success: false,
                error: 'Failed to fetch transcript'
            };
        }
    }

    async handleInitiateCall(userId, data) {
        try {
            const { phone, prompt, first_message } = data;

            if (!phone || !first_message) {
                return {
                    success: false,
                    error: 'Phone number and first message are required'
                };
            }

            // Validate phone format
            const e164Regex = /^\+[1-9]\d{1,14}$/;
            if (!e164Regex.test(phone.trim())) {
                return {
                    success: false,
                    error: 'Invalid phone number format. Use E.164 format like +1234567890'
                };
            }

            const payload = {
                number: phone,
                prompt: prompt || 'You are a helpful AI assistant making a phone call.',
                first_message: first_message,
                user_chat_id: userId.toString()
            };

            const response = await axios.post(`${config.apiUrl}/outbound-call`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId.toString()
                },
                timeout: 30000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error initiating call:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to initiate call'
            };
        }
    }
    async handleWebAppHealthCheck() {
    try {
        const response = await axios.get(`${config.apiUrl}/health`, {
            timeout: 5000
        });
        
        return {
            success: true,
            data: {
                api_status: response.data.status,
                timestamp: new Date().toISOString(),
                webapp_version: '2.0.0',
                features: {
                    calls: true,
                    sms: true,
                    admin: true,
                    realtime: true
                }
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'Health check failed'
        };
    }
}


    async handleSendSMS(userId, data) {
        try {
            const { phone, message } = data;

            if (!phone || !message) {
                return {
                    success: false,
                    error: 'Phone number and message are required'
                };
            }

            // Basic phone validation
            if (!phone.startsWith('+') || phone.length < 10) {
                return {
                    success: false,
                    error: 'Invalid phone number format. Use E.164 format like +1234567890'
                };
            }

            const payload = {
                to: phone,
                message: message,
                user_chat_id: userId.toString()
            };

            const response = await axios.post(`${config.apiUrl}/send-sms`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId.toString()
                },
                timeout: 30000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error sending SMS:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to send SMS'
            };
        }
    }

    async handleGetStats(userId) {
        try {
            const response = await axios.get(`${config.apiUrl}/user-stats/${userId}`, {
                timeout: 10000,
                headers: {
                    'X-User-ID': userId.toString()
                }
            });

            return {
                success: true,
                data: response.data || { total_calls: 0, total_sms: 0 }
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                success: true,
                data: { total_calls: 0, total_sms: 0, error: 'Stats unavailable' }
            };
        }
    }

    async handleGetActivity(userId, data) {
        try {
            const { limit = 10 } = data;
            
            const response = await axios.get(`${config.apiUrl}/api/calls/list?limit=${limit}&user_id=${userId}`, {
                timeout: 10000,
                headers: {
                    'X-User-ID': userId.toString()
                }
            });

            return {
                success: true,
                data: response.data.calls || response.data || []
            };
        } catch (error) {
            console.error('Error fetching activity:', error);
            return {
                success: false,
                error: 'Failed to fetch recent activity'
            };
        }
    }

    async handleWebAppCallback(ctx, action) {
        try {
            await ctx.answerCallbackQuery();
            
            switch (action) {
                case 'open':
                    await ctx.answerCallbackQuery('Opening VoicedNut Mini App...');
                    break;
                case 'refresh':
                    await ctx.answerCallbackQuery('Refreshing data...');
                    break;
                default:
                    await ctx.answerCallbackQuery('Processing...');
            }
        } catch (error) {
            console.error('Error handling webapp callback:', error);
            await ctx.answerCallbackQuery('An error occurred');
        }
    }

    async sendNotification(ctx, data) {
        try {
            const { success, error, action, data: responseData } = data;
            
            // Send appropriate notification based on action and result
            if (success) {
                switch (action) {
                    case 'ping':
                        await ctx.reply('🏓 Mini App connection test successful!');
                        break;
                    case 'initiateCall':
                        if (responseData?.call_sid) {
                            await ctx.reply(
                                `✅ *Call Initiated Successfully!*\n\n` +
                                `📞 To: ${responseData.to || 'Unknown'}\n` +
                                `🆔 Call SID: \`${responseData.call_sid}\`\n` +
                                `📊 Status: ${responseData.status || 'Initiated'}\n\n` +
                                `🔔 You'll receive notifications about call progress.`,
                                { parse_mode: 'Markdown' }
                            );
                        }
                        break;
                    case 'sendSMS':
                        if (responseData?.message_sid) {
                            await ctx.reply(
                                `✅ *SMS Sent Successfully!*\n\n` +
                                `📱 Message SID: \`${responseData.message_sid}\`\n` +
                                `📊 Status: ${responseData.status || 'Sent'}`,
                                { parse_mode: 'Markdown' }
                            );
                        }
                        break;
                    case 'addUser':
                        if (responseData?.username) {
                            await ctx.reply(`✅ User @${responseData.username} added successfully!`);
                        }
                        break;
                    case 'removeUser':
                        await ctx.reply('✅ User removed successfully!');
                        break;
                    case 'promoteUser':
                        await ctx.reply('✅ User promoted to admin successfully!');
                        break;
                    default:
                        // For other successful actions, send a generic success message
                        console.log(`WebApp action ${action} completed successfully`);
                }
            } else if (error) {
                // Send error notification
                let errorMessage = `❌ Mini App Error`;
                
                switch (action) {
                    case 'initiateCall':
                        errorMessage = `❌ Call Failed: ${error}`;
                        break;
                    case 'sendSMS':
                        errorMessage = `❌ SMS Failed: ${error}`;
                        break;
                    case 'addUser':
                        errorMessage = `❌ Add User Failed: ${error}`;
                        break;
                    case 'removeUser':
                        errorMessage = `❌ Remove User Failed: ${error}`;
                        break;
                    case 'promoteUser':
                        errorMessage = `❌ Promote User Failed: ${error}`;
                        break;
                    default:
                        errorMessage = `❌ ${action} Failed: ${error}`;
                }
                
                await ctx.reply(errorMessage);
            }
        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }
    }

    // Helper method to create web app keyboard
    createWebAppKeyboard(text = '🚀 Open VoicedNut') {
        if (!config.webAppUrl) {
            return null;
        }
        
        return new InlineKeyboard()
            .webApp(text, config.webAppUrl);
    }

    // Helper method to add webapp button to existing keyboards
    addWebAppButton(keyboard, text = '🚀 Open Mini App') {
        if (config.webAppUrl && keyboard instanceof InlineKeyboard) {
            return keyboard.row().webApp(text, config.webAppUrl);
        }
        return keyboard;
    }

    // Method to send webapp invitation
    async sendWebAppInvitation(ctx, message = null) {
        try {
            const user = await new Promise(resolve => getUser(ctx.from.id, resolve));
            if (!user) {
                return ctx.reply('❌ You are not authorized to use this bot.');
            }

            const defaultMessage = '🚀 *Experience VoicedNut Mini App*\n\n' +
                'Get access to enhanced features:\n' +
                '• 📞 Easy call management\n' +
                '• 💬 SMS messaging\n' +
                '• 📊 Real-time statistics\n' +
                '• 🎨 Modern interface\n\n' +
                'Click below to open the Mini App!';

            const keyboard = this.createWebAppKeyboard();
            if (!keyboard) {
                return ctx.reply('❌ Mini App is not configured.');
            }

            await ctx.reply(message || defaultMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Error sending webapp invitation:', error);
            await ctx.reply('❌ Error opening Mini App invitation.');
        }
    }

    // Health check method
    async checkWebAppHealth() {
        try {
            if (!config.webAppUrl) {
                return { healthy: false, error: 'WebApp URL not configured' };
            }

            // You could add more health checks here if needed
            return { healthy: true, url: config.webAppUrl };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }
}

module.exports = WebAppHandler;