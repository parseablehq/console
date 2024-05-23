import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import initContext from '@/utils/initContext';
import _ from 'lodash';

type ReducerOutput = Partial<ManagementStore>;

export type ConfigType = {
	column: string;
	operator: string;
	value: string | number;
	repeats: number;
	ignore_case?: boolean;
};

export interface RuleConfig {
	type: string;
	config: ConfigType;
}

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

type ManagementStore = {
	modalOpts: {
		deleteModalOpen: boolean;
	};
	schema: LogStreamSchemaData | null;
	retention: {
		action: 'delete';
		duration: number;
		description: string;
	};
	alertsConfig: TransformedAlerts;
};

type LogsStoreReducers = {
	streamChangeCleanup: (store: ManagementStore) => ReducerOutput;
	toggleDeleteModal: (store: ManagementStore, val?: boolean) => ReducerOutput;
	getCleanStoreForRefetch: (store: ManagementStore) => ReducerOutput;
	setStreamSchema: (store: ManagementStore, schema: LogStreamSchemaData) => ReducerOutput;
	setRetention: (store: ManagementStore, retention: { description: string; duration: string }) => ReducerOutput;
	setAlertsConfig: (store: ManagementStore, alertsResponse: AlertsResponse) => ReducerOutput;
	transformAlerts: (alerts: TransformedAlert[]) => Alert[];
	setCleanStoreForStreamChange: (store: ManagementStore) => ReducerOutput;
};

const initialState: ManagementStore = {
	modalOpts: {
		deleteModalOpen: false,
	},
	schema: null,
	retention: {
		action: 'delete',
		description: '',
		duration: 0,
	},
	alertsConfig: {
		version: '',
		alerts: [],
	},
};

const { Provider: ManagementProvider, useStore: useManagementStore } = initContext(initialState);

const streamChangeCleanup = (_store: ManagementStore) => {
	return { ...initialState };
};

const toggleDeleteModal = (store: ManagementStore, val?: boolean) => {
	const { modalOpts } = store;
	return { modalOpts: { ...modalOpts, deleteModalOpen: _.isBoolean(val) ? val : !modalOpts.deleteModalOpen } };
};

const setStreamSchema = (_store: ManagementStore, schema: LogStreamSchemaData) => {
	return {
		schema,
	};
};

const getCleanStoreForRefetch = (_store: ManagementStore) => {
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

const setCleanStoreForStreamChange = (_store: ManagementStore) => {
	return initialState
};

const setRetention = (_store: ManagementStore, retention: { duration?: string; description?: string }) => {
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
				if (type === 'column') {
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

const setAlertsConfig = (_store: ManagementStore, alertsResponse: AlertsResponse) => {
	const { alerts } = alertsResponse;
	const sanitizedAlerts: TransformedAlert[] = santizeAlerts(alerts);
	return {
		alertsConfig: { ...alertsResponse, alerts: sanitizedAlerts },
	};
};

const managementStoreReducers: LogsStoreReducers = {
	streamChangeCleanup,
	toggleDeleteModal,
	setStreamSchema,
	getCleanStoreForRefetch,
	setRetention,
	setAlertsConfig,
	transformAlerts,
	setCleanStoreForStreamChange,
};

export { ManagementProvider, useManagementStore, managementStoreReducers };
