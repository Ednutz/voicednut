import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { RouteWrapper } from '@/navigation/routes';
import { useRoute } from '@/navigation/routes';
import './RouteNavigator.css';

export const RouteNavigator: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isConnected } = useWebSocket();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const route = useRoute(location.pathname);

    useEffect(() => {
        if (!route) {
            navigate('/', { replace: true });
            return;
        }

        if (route.authRequired && !isConnected) {
            setError(new Error('Please connect to use this feature'));
            return;
        }

        const loadPage = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Simulate page load time for smooth transitions
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (err) {
                console.error('Failed to load page:', err);
                setError(err instanceof Error ? err : new Error('Failed to load page'));
            } finally {
                setIsLoading(false);
            }
        };

        void loadPage();
    }, [location.pathname, route, isConnected, navigate]);

    if (!route) return null;

    return (
        <div className="route-container">
            <div className="route-header glass">
                {route.icon && (
                    <div className="route-icon">
                        {route.icon}
                    </div>
                )}
                <h1 className="route-title gradient-text">
                    {route.title || 'VoicedNut'}
                </h1>
            </div>

            <div className="route-content">
                <RouteWrapper
                    route={route}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        </div>
    );
};