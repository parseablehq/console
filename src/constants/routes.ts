export const ALL_ROUTE = '/*';
export const HOME_ROUTE = '/';
export const LOGIN_ROUTE = '/login';
// -----
export const MANAGE_ROUTE = '/:streamName/manage';
export const LIVE_TAIL_ROUTE = '/:streamName/live-tail';
export const EXPLORE_ROUTE = '/:streamName/explore';
// -----
export const USERS_MANAGEMENT_ROUTE = '/users';
export const OIDC_NOT_CONFIGURED_ROUTE = '/oidc-not-configured';
export const CLUSTER_ROUTE = '/cluster';
export const STREAM_ROUTE = '/:streamName/:view?'

export const PATHS = {
	all: '/*',
	home: '/',
	explore: '/:streamName/explore',
	login: '/login',
	liveTail: '/:streamName/live-tail',
	stats: '/:streamName/stats',
	config: '/:streamName/config',
	users: '/users',
	oidcNotConfigured: '/oidc-not-configured',
	cluster: '/cluster',
	manage: '/:streamName/manage',
} as { [key: string]: string };
