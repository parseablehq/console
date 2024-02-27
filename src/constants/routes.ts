export const HOME_ROUTE = '/';
export const LOGS_ROUTE = '/:streamName/logs';
export const LOGIN_ROUTE = '/login';
export const ALL_ROUTE = '/*';
export const LIVE_TAIL_ROUTE = '/:streamName/live-tail';
export const STATS_ROUTE = '/:streamName/stats';
export const CONFIG_ROUTE = '/:streamName/config';
export const USERS_MANAGEMENT_ROUTE = '/users';
export const OIDC_NOT_CONFIGURED_ROUTE = '/oidc-not-configured';

export const PATHS = {
    all: '/*',
    home: '/',
    logs: '/:streamName/logs',
    login: '/login',
    liveTail: '/:streamName/live-tail',
    stats: '/:streamName/stats',
    config: '/:streamName/config',
    users: '/users',
    oidcNotConfigured: '/oidc-not-configured'
} as {[key: string]: string}