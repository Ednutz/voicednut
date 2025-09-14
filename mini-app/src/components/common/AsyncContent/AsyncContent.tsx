import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="card glass animate-in" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3 className="gradient-text">Something went wrong</h3>
          <p className="text-theme-text">{this.state.error?.message}</p>
          <button
            className="button mt-4"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  overlay = false
}) => {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '56px'
  };

  const Spinner = () => (
    <div
      className="loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size]
      }}
    />
  );

  if (overlay) {
    return (
      <div className="loading-overlay glass">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

export interface AsyncContentProps<T> {
  isLoading: boolean;
  error?: Error | null;
  data: T | null;
  loadingFallback?: JSX.Element;
  errorFallback?: (error: Error) => JSX.Element;
  children: (data: T) => JSX.Element;
}

export function AsyncContent<T>({
  isLoading,
  error,
  data,
  loadingFallback,
  errorFallback,
  children
}: AsyncContentProps<T>): JSX.Element {
  if (isLoading) {
    return loadingFallback || <LoadingSpinner overlay />;
  }

  if (error) {
    return errorFallback ? errorFallback(error) : (
      <div className="card glass animate-in" style={{ borderLeft: '4px solid #ef4444' }}>
        <h3 className="gradient-text">Error</h3>
        <p className="text-theme-text">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card glass animate-in">
        <p className="text-theme-hint">No data available</p>
      </div>
    );
  }

  return <>{children(data)}</>;
}

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  className = ''
}) => (
  <div
    className={`loading-shimmer ${className}`}
    style={{ width, height }}
  />
);
