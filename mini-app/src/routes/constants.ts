export const ROUTES = {
    HOME: '/',
    CALL: '/call',
    SMS: '/sms',
    USERS: '/users',
    TRANSCRIPTS: '/transcripts',
    SETTINGS: '/settings',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];