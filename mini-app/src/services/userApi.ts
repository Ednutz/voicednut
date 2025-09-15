import WebApp from '@twa-dev/sdk';

export interface User {
    id: number;
    username: string;
    isAdmin: boolean;
    dateAdded: string;
}

export class TelegramAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TelegramAuthError';
    }
}

type WebAppResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Helper function to handle WebApp response
const handleWebAppResponse = async <T>(action: string, data?: Record<string, any>): Promise<T> => {
    return new Promise((resolve, reject) => {
        try {
            // Add a unique request ID to match responses
            const requestId = Date.now().toString();
            const message = {
                action,
                requestId,
                ...data
            };

            // Set up response handler before sending data
            const handleResponse = (event: MessageEvent) => {
                try {
                    const response = JSON.parse(event.data) as WebAppResponse<T> & { requestId: string };
                    if (response.requestId !== requestId) return; // Not our response

                    // Clean up event listener
                    window.removeEventListener('message', handleResponse);

                    if (!response.success) {
                        throw new Error(response.error || `Failed to ${action}`);
                    }
                    resolve(response.data as T);
                } catch (error) {
                    reject(new TelegramAuthError(`Failed to ${action}`));
                }
            };

            // Listen for response
            window.addEventListener('message', handleResponse);

            // Send request
            WebApp.sendData(JSON.stringify(message));

            // Set timeout to prevent hanging
            setTimeout(() => {
                window.removeEventListener('message', handleResponse);
                reject(new TelegramAuthError('Request timeout'));
            }, 10000);
        } catch (error) {
            reject(new TelegramAuthError(`Failed to ${action}`));
        }
    });
};

export const userApi = {
    getUsers: async (): Promise<User[]> => {
        return handleWebAppResponse<User[]>('getUsers');
    },

    addUser: async (userId: number): Promise<User> => {
        return handleWebAppResponse<User>('addUser', { userId });
    },

    removeUser: async (userId: number): Promise<void> => {
        return handleWebAppResponse<void>('removeUser', { userId });
    },

    promoteUser: async (userId: number): Promise<User> => {
        return handleWebAppResponse<User>('promoteUser', { userId });
    },

    getCurrentUser: (): { id: number; username: string } | null => {
        const user = WebApp.initDataUnsafe?.user;
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            username: user.username || ''
        };
    },

    isAdmin: async (): Promise<boolean> => {
        const currentUser = userApi.getCurrentUser();
        if (!currentUser) return false;

        try {
            // Ask the bot if the user is an admin
            const response = await handleWebAppResponse<{ isAdmin: boolean }>('checkAdmin', {
                userId: currentUser.id
            });
            return response.isAdmin;
        } catch {
            return false;
        }
    }
};