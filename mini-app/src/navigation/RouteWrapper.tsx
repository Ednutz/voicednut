import React, { Suspense } from 'react';
import { AsyncContent } from '@/components/common/AsyncContent/AsyncContent';
import type { Route } from './routeTypes';

interface RouteProps {
    route: Route;
    isLoading?: boolean;
    error?: Error | null;
}

export const RouteWrapper: React.FC<RouteProps> = ({ route, isLoading, error }) => {
    return (
        <Suspense fallback={<div className="loading-overlay glass"><div className="loading-spinner" /></div>}>
            <AsyncContent
                isLoading={isLoading}
                error={error}
                data={route}
                loadingFallback={
                    <div className="loading-overlay glass">
                        <div className="loading-spinner" />
                        <p className="mt-4 text-theme-text">Loading {route.title || 'page'}...</p>
                    </div>
                }
            >
                {(data) => <data.Component />}
            </AsyncContent>
        </Suspense>
    );
};