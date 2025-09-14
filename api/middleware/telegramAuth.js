const crypto = require('crypto');

function verifyTelegramWebAppData(initData) {
    try {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');

        // Sort params alphabetically
        const params = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Create HMAC-SHA256
        const secret = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.BOT_TOKEN)
            .digest();

        const signature = crypto.createHmac('sha256', secret)
            .update(params)
            .digest('hex');

        if (signature !== hash) {
            throw new Error('Invalid hash');
        }

        // Parse user data
        return {
            id: parseInt(urlParams.get('user')?.id || '0'),
            first_name: urlParams.get('user')?.first_name,
            last_name: urlParams.get('user')?.last_name,
            username: urlParams.get('user')?.username,
            language: urlParams.get('user')?.language_code
        };
    } catch (error) {
        console.error('Telegram WebApp auth error:', error);
        return null;
    }
}

module.exports = {
    verifyTelegramWebAppData
};