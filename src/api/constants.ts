const API_V1 = 'api/v1';

// Streams Management
export const LOG_STREAM_LIST_URL = `${API_V1}/logstream`;
export const LOG_STREAMS_SCHEMA_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/schema`;
export const LOG_QUERY_URL = `${API_V1}/query`;
export const LOG_STREAMS_ALERTS_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/alert`;
export const LOG_STREAMS_RETRNTION_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/retention`;
export const LOG_STREAMS_STATS_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/stats`;
export const DELETE_STREAMS_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}`;

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

// LLM queries
export const LLM_QUERY_URL = `${API_V1}/llm`;
export const IS_LLM_ACTIVE_URL = `${LLM_QUERY_URL}/isactive`;

// caching
export const CACHING_STATUS_URL = (streamName: string) => `${LOG_STREAM_LIST_URL}/${streamName}/cache`;
