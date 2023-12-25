// Protected routes start

//
export const HOME_ROUTE = '/';
export const USERS_MANAGEMENT_ROUTE = '/team';

export const LIVE_TAIL_ROUTE = '/live-tail/:streamName';
export const LOGS_ROUTE = '/sql/:streamName';
export const QUERY_ROUTE = '/explore/:streamName';
export const STATS_ROUTE = '/management/:streamName';
export const CONFIG_ROUTE = '/:streamName/config';

// Protected routes end

// Non protected routes start
export const LOGIN_ROUTE = '/login';
export const OIDC_NOT_CONFIGURED_ROUTE = '/oidc-not-configured';
export const ALL_ROUTE = '/*';

// Non protected routes end

