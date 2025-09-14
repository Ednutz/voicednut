import React, { ReactNode } from 'react';
import './DataCard.css';

interface DataCardProps {
    title: string;
    icon?: ReactNode;
    value?: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
    className?: string;
    onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
    title,
    icon,
    value,
    trend,
    loading = false,
    className = '',
    onClick
}) => {
    const cardClasses = [
        'data-card',
        'glass',
        'animate-in',
        onClick ? 'hover-scale' : '',
        className
    ].filter(Boolean).join(' ');

    if (loading) {
        return (
            <div className={cardClasses} role="status">
                <div className="data-card__content">
                    <div className="data-card__header">
                        {icon && <div className="data-card__icon loading-shimmer" />}
                        <div className="data-card__title loading-shimmer" style={{ width: '60%' }} />
                    </div>
                    <div className="data-card__value loading-shimmer" style={{ width: '80%' }} />
                    <div className="data-card__trend loading-shimmer" style={{ width: '40%' }} />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cardClasses}
            onClick={onClick}
            role={onClick ? 'button' : 'region'}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="data-card__content">
                <div className="data-card__header">
                    {icon && <div className="data-card__icon">{icon}</div>}
                    <h3 className="data-card__title">{title}</h3>
                </div>

                {value && (
                    <div className="data-card__value">
                        {value}
                    </div>
                )}

                {trend && (
                    <div className={`data-card__trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        <span className="trend-arrow">
                            {trend.isPositive ? '↑' : '↓'}
                        </span>
                        <span className="trend-value">
                            {Math.abs(trend.value)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};