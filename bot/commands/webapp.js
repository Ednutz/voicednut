const { InlineKeyboard } = require('grammy');
const { getUser, isAdmin } = require('../db/db');
const config = require('../config');

module.exports = (bot) => {
    // Command to open Mini App 
    bot.command(['app', 'miniapp', 'webapp'], async (ctx) => {
    try {
        // Verify user authorization
        const user = await new Promise(r => getUser(ctx.from.id, r));
        if (!user) {
            const kb = new InlineKeyboard()
                .text('📱 Contact Admin', `https://t.me/@${config.admin.username}`);
            
            return ctx.reply('*Access Restricted* ⚠️\n\n' +
                'This bot requires authorization.\n' +
                'Please contact an administrator to get access.', {
                parse_mode: 'Markdown',
                reply_markup: kb
            });
        }

        // Check if Mini App URL is configured
        if (!config.webAppUrl) {
            return ctx.reply('❌ Mini App is not configured. Please contact the administrator.');
        }

        const isOwner = await new Promise(r => isAdmin(ctx.from.id, r));
        
        const welcomeMessage = `🚀 *VoicedNut Mini App*\n\n` +
            `Welcome to the enhanced ${isOwner ? 'admin' : 'user'} experience!\n\n` +
            `✨ *What you can do:*\n` +
            `• 📞 Make AI-powered voice calls\n` +
            `• 💬 Send SMS messages\n` +
            `• 📊 View real-time statistics\n` +
            `• 📋 Access call history & transcripts\n` +
            `• 🎨 Modern, intuitive interface\n` +
            (isOwner ? `• 👥 Manage users & permissions\n` +
                      `• 📈 Advanced admin features\n` : '') +
            `\n*Click the button below to launch the Mini App!*`;

        const kb = new InlineKeyboard()
            .webApp('🚀 Launch VoicedNut', config.webAppUrl);

        await ctx.reply(welcomeMessage, {
            parse_mode: 'Markdown',
            reply_markup: kb
        });

    } catch (error) {
        console.error('Mini App command error:', error);
        await ctx.reply('❌ Error launching Mini App. Please try again or contact support.');
    }
});
        // Command for getting Mini App info
    bot.command('miniappinfo', async (ctx) => {
        try {
            const user = await new Promise(r => getUser(ctx.from.id, r));
            if (!user) {
                return ctx.reply('❌ You are not authorized to use this bot.');
            }

            const isAdminUser = await new Promise(r => isAdmin(ctx.from.id, r));
            
            let infoText = `ℹ️ *Mini App Information*\n\n`;
            infoText += `🌐 Status: ${config.webAppUrl ? '✅ Configured' : '❌ Not Configured'}\n`;
            
            if (config.webAppUrl) {
                infoText += `🔗 URL: \`${config.webAppUrl}\`\n`;
                infoText += `🚀 Features Available:\n`;
                infoText += `  • Voice calls management\n`;
                infoText += `  • SMS messaging\n`;
                infoText += `  • Real-time notifications\n`;
                infoText += `  • Activity tracking\n`;
                
                if (isAdminUser) {
                    infoText += `  • User management\n`;
                    infoText += `  • System statistics\n`;
                    infoText += `  • Admin controls\n`;
                }
                
                infoText += `\n🎯 Use /app to open the Mini App`;
            } else {
                infoText += `\n⚠️ Mini App is not configured. Contact admin.`;
            }
            
            const kb = new InlineKeyboard();
            if (config.webAppUrl) {
                kb.webApp('🚀 Open Mini App', config.webAppUrl);
            }
            
            await ctx.reply(infoText, {
                parse_mode: 'Markdown',
                reply_markup: kb
            });
            
        } catch (error) {
            console.error('Mini App info error:', error);
            await ctx.reply('❌ Error getting Mini App information.');
        }
    });
};


    // Handle web app data received from the Mini App
    bot.on('message:web_app_data', async (ctx) => {
        try {
            const user = await new Promise(r => getUser(ctx.from.id, r));
            if (!user) {
                return ctx.reply('❌ You are not authorized to use this bot.');
            }

            const webAppData = JSON.parse(ctx.message.web_app_data.data);
            console.log('Received Mini App data from user', ctx.from.id, ':', webAppData);

            await handleMiniAppAction(ctx, webAppData, user);

        } catch (error) {
            console.error('Web App data error:', error);
            await ctx.reply('❌ Error processing Mini App request. Please try again.');
        }
    });
    
// Handle different actions from Mini App
async function handleMiniAppAction(ctx, data, user) {
    const { action, result, ...params } = data;
    
    console.log(`Mini App action from user ${ctx.from.id}: ${action}`, params);

    switch (action) {
        case 'call':
            if (result === 'success') {
                await ctx.reply(`✅ Call initiated successfully!\n🆔 Call SID: \`${params.call_sid}\`\n\n🔔 You'll receive notifications about call progress.`, 
                    { parse_mode: 'Markdown' });
            } else {
                await handleMiniAppCall(ctx, params, user);
            }
            break;
            
        case 'sms':
            if (result === 'success') {
                await ctx.reply(`✅ SMS sent successfully!\n🆔 Message SID: \`${params.message_sid}\``, 
                    { parse_mode: 'Markdown' });
            } else {
                await handleMiniAppSms(ctx, params, user);
            }
            break;

        case 'user_added':
            if (result === 'success') {
                await ctx.reply(`✅ User @${params.username} added successfully!`, 
                    { parse_mode: 'Markdown' });
            } else {
                await ctx.reply(`❌ Failed to add user: ${params.error || 'Unknown error'}`);
            }
            break;

        case 'user_removed':
            if (result === 'success') {
                await ctx.reply(`✅ User removed successfully!`);
            } else {
                await ctx.reply(`❌ Failed to remove user: ${params.error || 'Unknown error'}`);
            }
            break;

        case 'user_promoted':
            if (result === 'success') {
                await ctx.reply(`✅ User promoted to admin successfully!`);
            } else {
                await ctx.reply(`❌ Failed to promote user: ${params.error || 'Unknown error'}`);
            }
            break;
            
        case 'get_stats':
            await handleMiniAppStats(ctx, user);
            break;
            
        case 'get_recent_activity':
            await handleMiniAppActivity(ctx, user);
            break;

        case 'notification':
            // Handle notifications from Mini App
            await ctx.reply(`🔔 ${params.message || 'Notification from Mini App'}`);
            break;
            
        default:
            console.warn('Unknown Mini App action:', action);
            await ctx.reply('❌ Unknown Mini App action received.');
    }
}

// Handle call request from Mini App (fallback if API call failed)
async function handleMiniAppCall(ctx, params, user) {
    const { phone, prompt, first_message } = params;
    
    try {
        // Validate input
        if (!phone || !prompt || !first_message) {
            await ctx.reply('❌ Missing required fields for call');
            return;
        }

        // Validate phone format
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        if (!e164Regex.test(phone.trim())) {
            await ctx.reply('❌ Invalid phone number format. Use E.164 format like +1234567890');
            return;
        }

        // Make the API call (using existing call logic)
        const axios = require('axios');
        const payload = {
            number: phone,
            prompt: prompt,
            first_message: first_message,
            user_chat_id: ctx.from.id.toString()
        };

        console.log('Mini App fallback call payload:', payload);

        const response = await axios.post(`${config.apiUrl}/outbound-call`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        if (response.data.success && response.data.call_sid) {
            const successMsg = `✅ *Call Placed Successfully via Mini App!*\n\n` +
                `📞 To: ${response.data.to}\n` +
                `🆔 Call SID: \`${response.data.call_sid}\`\n` +
                `📊 Status: ${response.data.status}\n\n` +
                `🔔 You'll receive notifications about call progress.`;

            await ctx.reply(successMsg, { parse_mode: 'Markdown' });
        } else {
            await ctx.reply('❌ Call failed - unexpected response from API');
        }

    } catch (error) {
        console.error('Mini App fallback call error:', error);
        
        let errorMsg = 'Call failed';
        if (error.response?.data?.error) {
            errorMsg = error.response.data.error;
        } else if (error.message) {
            errorMsg = error.message;
        }

        await ctx.reply(`❌ ${errorMsg}`);
    }
}

// Handle SMS request from Mini App (fallback if API call failed)
async function handleMiniAppSms(ctx, params, user) {
    const { phone, message } = params;
    
    try {
        // Validate input
        if (!phone || !message) {
            await ctx.reply('❌ Missing phone number or message');
            return;
        }

        // Basic phone validation
        if (!phone.startsWith('+') || phone.length < 10) {
            await ctx.reply('❌ Invalid phone number format. Use E.164 format like +1234567890');
            return;
        }

        // Make SMS API call
        const axios = require('axios');
        const payload = {
            to: phone,
            message: message,
            user_chat_id: ctx.from.id.toString()
        };

        const response = await axios.post(`${config.apiUrl}/send-sms`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        if (response.data.success) {
            const successMsg = `✅ *SMS Sent Successfully via Mini App!*\n\n` +
                `📱 To: ${phone}\n` +
                `📄 Message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}\n` +
                `🆔 Message SID: \`${response.data.message_sid}\``;

            await ctx.reply(successMsg, { parse_mode: 'Markdown' });
        } else {
            await ctx.reply('❌ SMS failed - unexpected response from API');
        }

    } catch (error) {
        console.error('Mini App fallback SMS error:', error);
        
        let errorMsg = 'SMS failed';
        if (error.response?.data?.error) {
            errorMsg = error.response.data.error;
        }

        await ctx.reply(`❌ ${errorMsg}`);
    }
}

// Handle stats request from Mini App
async function handleMiniAppStats(ctx, user) {
    try {
        const axios = require('axios');
        
        // Get user stats from API
        const response = await axios.get(`${config.apiUrl}/user-stats/${ctx.from.id}`, {
            timeout: 10000
        });

        const stats = response.data || { total_calls: 0, total_sms: 0, recent_activity: [] };
        
        // Format stats message
        let statsMsg = `📊 *Your Statistics*\n\n`;
        statsMsg += `📞 Total Calls: ${stats.total_calls || 0}\n`;
        statsMsg += `💬 Total SMS: ${stats.total_sms || 0}\n`;
        statsMsg += `📈 This Month: ${stats.this_month_calls || 0} calls, ${stats.this_month_sms || 0} SMS\n`;
        statsMsg += `✅ Success Rate: ${stats.success_rate || 0}%\n`;
        
        if (stats.last_activity) {
            statsMsg += `🕐 Last Activity: ${formatTimeAgo(stats.last_activity)}\n`;
        }
        
        await ctx.reply(statsMsg, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Mini App stats error:', error);
        await ctx.reply('📊 Statistics: 0 calls, 0 SMS (Unable to load detailed stats)');
    }
}

// Handle recent activity request from Mini App
async function handleMiniAppActivity(ctx, user) {
    try {
        const axios = require('axios');
        
        // Get recent calls and activity
        const response = await axios.get(`${config.apiUrl}/api/calls/list?limit=5&user_id=${ctx.from.id}`, {
            timeout: 10000
        });

        const calls = response.data.calls || [];
        
        if (calls.length === 0) {
            await ctx.reply('📋 No recent activity found.');
            return;
        }
        
        // Format activity message
        let activityMsg = `📋 *Recent Activity*\n\n`;
        
        calls.forEach((call, index) => {
            const status = call.status === 'completed' ? '✅' : 
                          call.status === 'failed' ? '❌' : 
                          call.status === 'busy' ? '📵' : '⏳';
            
            activityMsg += `${index + 1}. ${status} Call to ${call.phone_number}\n`;
            activityMsg += `   Duration: ${formatDuration(call.duration)} • ${formatTimeAgo(call.created_at)}\n`;
            if (call.call_sid) {
                activityMsg += `   SID: \`${call.call_sid.substring(0, 20)}...\`\n`;
            }
            activityMsg += `\n`;
        });

        await ctx.reply(activityMsg, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Mini App activity error:', error);
        await ctx.reply('📋 Unable to load recent activity. Use /calls to see call history.');
    }
}

// Utility functions
function formatDuration(seconds) {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    } catch (error) {
        return 'Unknown';
    }
}

// Add Mini App button to existing menus (utility function)
function addMiniAppButton(keyboard) {
    if (config.webAppUrl) {
        return keyboard.row().webApp('🚀 Open Mini App', config.webAppUrl);
    }
    return keyboard;
}

// Export utility function for other modules
module.exports.addMiniAppButton = addMiniAppButton;