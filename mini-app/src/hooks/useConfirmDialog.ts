import WebApp from '@twa-dev/sdk';

export interface ConfirmOptions {
    message: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
}

export const useConfirmDialog = () => {
    const showConfirm = async (options: ConfirmOptions) => {
        try {
            if (!WebApp.ready) {
                throw new Error('Telegram WebApp is not ready');
            }

            WebApp.showConfirm(options.message, async (confirmed: boolean) => {
                try {
                    if (confirmed) {
                        await Promise.resolve(options.onConfirm());
                    } else if (options.onCancel) {
                        await Promise.resolve(options.onCancel());
                    }
                } catch (error) {
                    options.onError?.(error);
                    console.error('Error in confirm dialog handler:', error);
                }
            });
        } catch (error) {
            options.onError?.(error);
            console.error('Error showing confirm dialog:', error);
        }
    };

    return { showConfirm };
};