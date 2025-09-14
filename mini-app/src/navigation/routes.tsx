import { lazy } from 'react';
import type { Route } from './routeTypes';

// Lazy load components
const IndexPage = lazy(() => import('@/pages/IndexPage/IndexPage').then(m => ({ default: m.IndexPage })));
const InitDataPage = lazy(() => import('@/pages/InitDataPage').then(m => ({ default: m.InitDataPage })));
const LaunchParamsPage = lazy(() => import('@/pages/LaunchParamsPage').then(m => ({ default: m.LaunchParamsPage })));
const ThemeParamsPage = lazy(() => import('@/pages/ThemeParamsPage').then(m => ({ default: m.ThemeParamsPage })));
const TONConnectPage = lazy(() => import('@/pages/TONConnectPage/TONConnectPage').then(m => ({ default: m.TONConnectPage })));

export const routes: readonly Route[] = [
  {
    path: '/',
    Component: IndexPage,
    title: 'Dashboard',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
      </svg>
    )
  },
  {
    path: '/init-data',
    Component: InitDataPage,
    title: 'Init Data',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    authRequired: true
  },
  {
    path: '/theme-params',
    Component: ThemeParamsPage,
    title: 'Theme Params',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor" />
      </svg>
    ),
    authRequired: true
  },
  {
    path: '/launch-params',
    Component: LaunchParamsPage,
    title: 'Launch Params',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12.6 2.86A2 2 0 0012 2.5c-.36 0-.71.11-1 .29l-8 4.5A2 2 0 002 8.5v7c0 .71.38 1.36 1 1.71l8 4.5A2 2 0 0013 21.5V12.7l8.4-4.7-8.8-5.14zM4 15.5v-7l6 3.5v7l-6-3.5z" fill="currentColor" />
      </svg>
    )
  },
  {
    path: '/ton-connect',
    Component: TONConnectPage,
    title: 'TON Connect',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 56 56"
        fill="none"
      >
        <path
          d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z"
          fill="#0098EA"
        />
        <path
          d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z"
          fill="white"
        />
      </svg>
    ),
    authRequired: true
  },
];

export const useRoute = (path: string) => {
  return routes.find(route => route.path === path);
};