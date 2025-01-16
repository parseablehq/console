import _ from 'lodash';

const API_V1 = 'api/v1';

export type Params = Record<string, string> | null | object | undefined;

const parseParamsToQueryString = (params: Params) => {
	if (_.isEmpty(params) || _.isNil(params) || !params) return '';

	return _.reduce(
		params,
		(acc, value, key) => {
			const slugPartPrefix = acc === '?' ? '' : '&';
			return acc + slugPartPrefix + key + '=' + value;
		},
		'?',
	);
};

// Streams Management
export const LOG_STREAM_LIST_URL = `${API_V1}/logstream`;
export const LOG_STREAMS_SCHEMA_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/schema`;
export const GRAPH_DATA_URL = `${API_V1}/counts`;
export const LOG_QUERY_URL = (params?: Params, resourcePath = 'query') =>
	`${API_V1}/${resourcePath}` + parseParamsToQueryString(params);
export const LOG_STREAMS_ALERTS_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/alert`;
export const LIST_SAVED_FILTERS_URL = `${API_V1}/filters`;
export const LIST_DASHBOARDS = `${API_V1}/dashboards`;
export const UPDATE_SAVED_FILTERS_URL = (filterId: string) => `${API_V1}/filters/${filterId}`;
export const UPDATE_DASHBOARDS_URL = (dashboardId: string) => `${API_V1}/dashboards/${dashboardId}`;
export const DELETE_DASHBOARDS_URL = (dashboardId: string) => `${API_V1}/dashboards/${dashboardId}`;
export const CREATE_SAVED_FILTERS_URL = `${API_V1}/filters`;
export const CREATE_DASHBOARDS_URL = `${API_V1}/dashboards`;
export const DELETE_SAVED_FILTERS_URL = (filterId: string) => `${API_V1}/filters/${filterId}`;
export const LOG_STREAMS_RETRNTION_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/retention`;
export const LOG_STREAMS_STATS_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/stats`;
export const LOG_STREAMS_INFO_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/info`;
export const DELETE_STREAMS_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}`;
export const DETECT_LOG_STREAM_SCHEMA_URL = `${LOG_STREAM_LIST_URL}/schema/detect`;
export const CREATE_STREAM_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}`;
export const LOG_STREAM_HOT_TIER = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/hottier`;

// About Parsable Instance
export const ABOUT_URL = `${API_V1}/about`;

// Users Management
export const USERS_LIST_URL = `${API_V1}/user`;
export const USER_URL = (username: string) => `${USERS_LIST_URL}/${username}`;
export const USER_ROLES_URL = (username: string) => `${USER_URL(username)}/role`;
export const USER_PASSWORD_URL = (username: string) => `${USER_URL(username)}/generate-new-password`;
export const DEFAULT_ROLE_URL = `${API_V1}/role/default`;

// Roles Management
export const ROLES_LIST_URL = `${API_V1}/role`;
export const ROLE_URL = (roleName: string) => `${ROLES_LIST_URL}/${roleName}`;

// USERS LOGIN
export const LOGIN_URL = `${API_V1}/o/login?redirect=${window.location.origin}`;
export const LOGOUT_URL = `${API_V1}/o/logout?redirect=${window.location.origin}`;

// LLM queries
export const LLM_QUERY_URL = `${API_V1}/llm`;
export const IS_LLM_ACTIVE_URL = `${LLM_QUERY_URL}/isactive`;

export const CLUSTER_INFO_URL = `${API_V1}/cluster/info`;
export const CLUSTER_METRICS_URL = `${API_V1}/cluster/metrics`;
export const INGESTOR_DELETE_URL = (ingestorUrl: string) => `${API_V1}/cluster/${ingestorUrl}`;
