import WebApp from '@twa-dev/sdk';
import { create } from 'zustand';

interface User {
    id: number;
    username: string;
    isAdmin: boolean;
}

interface AuthStoreState {
    initialized: boolean;
    user: User | null;
    error: string | null;
}

interface AuthStoreActions {
    setUser: (user: User | null) => void;
    setInitialized: (initialized: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

const initialState: AuthStoreState = {
    initialized: false,
    user: null,
    error: null
};

export const useAuthStore = create<AuthStore>((set) => ({
    ...initialState,
    setUser: (user: User | null) => set({ user, error: null }),
    setInitialized: (initialized: boolean) => set({ initialized }),
    setError: (error: string | null) => set({ error }),
    reset: () => set(initialState)
}));

interface VerifyUserResponse {
    authorized: boolean;
    isAdmin: boolean;
    error?: string;
}

export const initializeAuth = async () => {
    const store = useAuthStore.getState();

    if (store.initialized) return;

    try {
        if (!WebApp.ready) {
            throw new Error('Telegram WebApp is not ready');
        }

        const webAppUser = WebApp.initDataUnsafe?.user;
        if (!webAppUser) {
            throw new Error('No user data available');
        }

        const { id, username } = webAppUser;

        // Send data to bot to verify user and get admin status
        const dataToSend = JSON.stringify({
            action: 'verifyUser',
            userId: id,
            timestamp: Date.now() // Add timestamp for request uniqueness
        });

        // Wrap WebApp.sendData in a Promise to handle the response
        const response = await new Promise<string>((resolve) => {
            WebApp.sendData(dataToSend);
            WebApp.onEvent('mainButtonClicked', () => {
                resolve(WebApp.initData || '{}');
            });
        });

        let userData: VerifyUserResponse;
        try {
            userData = JSON.parse(response);
        } catch (e) {
            throw new Error('Invalid response from server');
        }

        if (userData.error) {
            throw new Error(userData.error);
        }

        if (userData.authorized) {
            store.setUser({
                id,
                username: username || String(id),
                isAdmin: userData.isAdmin
            });
        } else {
            throw new Error('User not authorized');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        store.setError(errorMessage);
        console.error('Auth initialization error:', error);
    } finally {
        store.setInitialized(true);
    }
};