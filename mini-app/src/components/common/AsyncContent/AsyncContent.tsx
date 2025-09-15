import React from 'react';

interface AsyncContentProps<T> {
    isLoading: boolean;
    error: Error | null;
    data: T | null;
    loadingFallback?: React.ReactNode;
    errorFallback?: (error: Error) => React.ReactNode;
    children: (data: T) => React.ReactNode;
}export function AsyncContent<T>({
    isLoading,
    error,
    data,
    loadingFallback,
    children
}: AsyncContentProps<T>) {
    if (isLoading) {
        return <>{loadingFallback}</>;
    }

    if (error) {
        return (
            <div className="error">
                <p>{error.message}</p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return <>{children(data)}</>;
}