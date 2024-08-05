import { HotTierConfig, LogStreamSchemaData, LogStreamStat, StreamInfo } from '@/@types/parseable/api/stream';
import initContext from '@/utils/initContext';
import _ from 'lodash';
import { AxiosResponse } from 'axios';

type ReducerOutput = Partial<StreamStore>;

export type ConfigType = {
	column: string;
	operator: string;
	value: string | number;
	repeats: number;
	ignore_case?: boolean;
};

export type RuleType = 'column' | 'composite';
export type RuleConfig = { type: 'column'; config: ConfigType } | { type: 'composite'; config: string };

type FieldTypeMap = {
	[key: string]: 'text' | 'number';
};

export interface Target {
	type: string;
	endpoint: string;
	username?: string;
	password?: string;
	headers?: Record<string, string>;
	skip_tls_check: boolean;
	repeat: {
		interval: string;
		times: number;
	};
}

export interface TransformedTarget {
	type: string;
	endpoint: string;
	username?: string;
	password?: string;
	headers?: Record<string, string>[];
	skip_tls_check: boolean;
	repeat: {
		interval: string;
		times: number;
	};
}

export interface Alert {
	name: string;
	message: string;
	rule: RuleConfig;
	targets: Target[];
}

export interface TransformedAlert {
	name: string;
	message: string;
	rule: RuleConfig;
	targets: TransformedTarget[];
}

export interface AlertsResponse {
	version: string;
	alerts: Alert[];
}

export type TransformedAlerts = {
	version: string;
	alerts: TransformedAlert[];
};

type StreamStore = {
	// meta
	schema: LogStreamSchemaData | null;
	fieldNames: string[];
	fieldTypeMap: FieldTypeMap;
	stats: LogStreamStat | {};
	// configs
	retention: {
		action: 'delete';
		duration: number;
		description: string;
	};
	alertsConfig: TransformedAlerts;
	hotTier: HotTierConfig;
	info: StreamInfo | {};
	sideBarOpen: boolean;
	cacheEnabled: boolean | null;
};

type LogsStoreReducers = {
	streamChangeCleanup: (store: StreamStore) => ReducerOutput;
	getCleanStoreForRefetch: (store: StreamStore) => ReducerOutput;
	setStreamSchema: (store: StreamStore, schema: LogStreamSchemaData) => ReducerOutput;
	setRetention: (store: StreamStore, retention: { description: string; duration: string }) => ReducerOutput;
	setAlertsConfig: (store: StreamStore, alertsResponse: AxiosResponse<AlertsResponse>) => ReducerOutput;
	setStats: (store: StreamStore, alertsResponse: AxiosResponse<LogStreamStat>) => ReducerOutput;
	transformAlerts: (alerts: TransformedAlert[]) => Alert[];
	setCleanStoreForStreamChange: (store: StreamStore) => ReducerOutput;
	toggleSideBar: (store: StreamStore) => ReducerOutput;
	setCacheEnabled: (store: StreamStore, enabled: boolean) => ReducerOutput;
	setStreamInfo: (_store: StreamStore, infoResponse: AxiosResponse<StreamInfo>) => ReducerOutput;
	setHotTier: (_store: StreamStore, hotTier: HotTierConfig) => ReducerOutput;
};

const initialState: StreamStore = {
	schema: null,
	fieldNames: [],
	fieldTypeMap: {},
	stats: {},
	retention: {
		action: 'delete',
		description: '',
		duration: 0,
	},
	alertsConfig: {
		version: '',
		alerts: [],
	},
	info: {},
	sideBarOpen: false,
	cacheEnabled: null,
	hotTier: {}
};

const { Provider: StreamProvider, useStore: useStreamStore } = initContext(initialState);

const streamChangeCleanup = (store: StreamStore) => {
	return { ...initialState, sideBarOpen: store.sideBarOpen };
};

const toggleSideBar = (store: StreamStore) => {
	return {
		sideBarOpen: !store.sideBarOpen
	}
}

const setCacheEnabled = (_store: StreamStore, enabled: boolean) => {
	return {
		cacheEnabled: enabled
	}
}

const parseType = (type: any): 'text' | 'number' => {
	if (typeof type === 'object') {
		// console.error('Error finding type for an object', type);
		return 'text';
	}
	const lowercaseType = type.toLowerCase();
	if (lowercaseType.startsWith('int') || lowercaseType.startsWith('float') || lowercaseType.startsWith('double')) {
		return 'number';
	} else {
		return 'text';
	}
};

const setStreamSchema = (_store: StreamStore, schema: LogStreamSchemaData) => {
	const fieldNames = schema.fields.map((field) => field.name);
	const fieldTypeMap = schema.fields.reduce((acc, field) => {
		return { ...acc, [field.name]: parseType(field.data_type) };
	}, {});
	return {
		schema,
		fieldNames,
		fieldTypeMap,
	};
};

const getCleanStoreForRefetch = (_store: StreamStore) => {
	// const { tableOpts, data, timeRange } = store;
	// const { interval, type } = timeRange;

	// const duration = _.find(FIXED_DURATIONS, (duration) => duration.name === timeRange.label);
	// const updatedTimeRange = interval && type === 'fixed' ? { timeRange: getDefaultTimeRange(duration) } : {};
	// return {
	// 	tableOpts: {
	// 		...tableOpts,
	// 		pageData: [],
	// 		totalCount: 0,
	// 		displayedCount: 0,
	// 		currentPage: 0,
	// 		currentOffset: 0,
	// 		headers: [],
	// 		totalPages: 0,
	// 	},
	// 	data: {
	// 		...data,
	// 		filteredData: [],
	// 		rawData: [],
	// 	},
	// 	...updatedTimeRange,
	// };
	return initialState;
};

const setCleanStoreForStreamChange = (_store: StreamStore) => {
	return initialState;
};

const setRetention = (_store: StreamStore, retention: { duration?: string; description?: string }) => {
	const durationInNumber = _.isString(retention.duration)
		? _.chain(retention.duration).split('d').head().toInteger().value()
		: 0;
	return {
		retention: {
			duration: durationInNumber,
			description: retention.description || '',
			action: 'delete' as 'delete',
		},
	};
};

const setStreamInfo = (_store: StreamStore, infoResponse: AxiosResponse<StreamInfo>) => {
	return {
		info: infoResponse.data
	}
}

const setHotTier = (_store: StreamStore, hotTier: HotTierConfig) => {
	return {
		hotTier
	}
}

const operatorLabelMap = {
	lessThanEquals: '<=',
	greaterThanEquals: '>=',
	lessThan: '<',
	greaterThan: '>',
	equalTo: '=',
	notEqualTo: '!=',
	exact: '=',
	notExact: '!=',
	contains: '=%',
	notContains: '!%',
	regex: '~',
};

// transforms alerts data for forms
const santizeAlerts = (alerts: Alert[]): TransformedAlert[] => {
	// @ts-ignore
	return _.reduce(
		alerts,
		// @ts-ignore
		(acc: Alert[], alert: Alert) => {
			const { targets = [], rule } = alert;
			const updatedRule = (() => {
				const { type, config } = rule;
				if (type === 'column' && typeof config !== 'string' && config.operator) {
					const updatedOperator = _.get(operatorLabelMap, config.operator, config.operator);
					return {
						type,
						config: {
							...config,
							operator: updatedOperator,
						},
					};
				} else {
					return rule;
				}
			})();
			const updatedTargets = _.map(targets, (target) => {
				if (target.type === 'webhook') {
					const { headers = {} } = target;
					const headersAsArray = _.map(headers, (v, k) => ({ header: k, value: v }));
					return { ...target, headers: headersAsArray };
				} else {
					return target;
				}
			});

			return [...acc, { ...alert, targets: updatedTargets, rule: updatedRule }];
		},
		[] as TransformedAlert[],
	);
};

const transformAlerts = (alerts: TransformedAlert[]): Alert[] => {
	return _.reduce(
		alerts,
		// @ts-ignore
		(acc: Alert[], alert) => {
			const { targets = [] } = alert;
			const updatedTargets = _.map(targets, (target) => {
				if (target.type === 'webhook') {
					const { headers = {}, endpoint, skip_tls_check, repeat, type } = target;
					const transformedHeaders: { [key: string]: string } = {};
					if (_.isArray(headers)) {
						_.map(headers, (h: { header: string; value: string }) => {
							transformedHeaders[h.header] = h.value;
						});
					}
					return { type, endpoint, skip_tls_check, repeat, headers: transformedHeaders };
				} else if (target.type === 'slack') {
					const { repeat, endpoint, type } = target;
					return { repeat, endpoint, type };
				} else if (target.type === 'alertmanager') {
					const { endpoint, skip_tls_check, repeat, type, username, password } = target;
					return { type, endpoint, skip_tls_check, repeat, username, password };
				} else {
					return target;
				}
			});
			return [...acc, { ...alert, targets: updatedTargets }];
		},
		[] as Alert[],
	);
};

const setAlertsConfig = (_store: StreamStore, alertsResponse: AxiosResponse<AlertsResponse>) => {
	if (!alertsResponse.data?.alerts) {
		return {};
	}

	const { alerts } = alertsResponse.data;
	const sanitizedAlerts: TransformedAlert[] = santizeAlerts(alerts);
	return {
		alertsConfig: { ...alertsResponse.data, alerts: sanitizedAlerts },
	};
};

const setStats = (_store: StreamStore, stats: AxiosResponse<LogStreamStat>) => {
	return {
		stats: stats.data,
	};
};

const streamStoreReducers: LogsStoreReducers = {
	streamChangeCleanup,
	setStreamSchema,
	getCleanStoreForRefetch,
	setRetention,
	setAlertsConfig,
	transformAlerts,
	setCleanStoreForStreamChange,
	setStats,
	toggleSideBar,
	setCacheEnabled,
	setStreamInfo,
	setHotTier
};

export { StreamProvider, useStreamStore, streamStoreReducers };
