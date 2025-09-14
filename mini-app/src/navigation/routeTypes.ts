import type { ComponentType, JSX } from 'react';

export interface Route {
    path: string;
    Component: ComponentType<Record<string, unknown>>;
    title?: string;
    icon?: JSX.Element;
    authRequired?: boolean;
}