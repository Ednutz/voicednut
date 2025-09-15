import React from 'react';

interface DataCardProps {
    title: string;
    value?: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
    onClick?: () => void;
    className?: string;
}export const DataCard: React.FC<DataCardProps> = ({
    title,
    value,
    icon,
    trend,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="data-card loading">
                <div className="data-card-content">
                    <h3>{title}</h3>
                    <div className="loading-placeholder" />
                </div>
            </div>
        );
    }

    return (
        <div className="data-card">
            <div className="data-card-content">
                <h3>{title}</h3>
                {icon && <div className="data-card-icon">{icon}</div>}
                {value && <div className="data-card-value">{value}</div>}
                {trend && (
                    <div className={`data-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        <span>{trend.value}%</span>
                        <span className="trend-arrow">{trend.isPositive ? '↑' : '↓'}</span>
                    </div>
                )}
            </div>
        </div>
    );
};