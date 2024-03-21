import { LogStreamData } from '@/@types/parseable/api/stream';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import createFastContext from '@/utils/createFastContext';
import dayjs from 'dayjs';

export const DEFAULT_FIXED_DURATIONS = FIXED_DURATIONS[0];

type ReducerOutput = Partial<LogsStore>;

type TimeRange = {
	startTime: Date;
	endTime: Date;
	type: 'fixed' | 'custom';
	label: string;
};

enum SortOrder {
	ASCENDING = 1,
	DESCENDING = -1,
}

type QuickFilters = {
	search: string;
	filters: Record<string, string[]>;
	sort: {
		key: string;
		order: SortOrder;
	};
};

type LiveTailStatus = 'streaming' | 'stopped' | 'abort' | 'fetch' | '';

type LiveTailConfig = {
	liveTailStatus: LiveTailStatus;
	liveTailSchemaData: LogStreamData;
	liveTailSearchValue: string;
	liveTailSearchField: string;
};

const getDefaultTimeRange = () => {
	const now = dayjs().startOf('minute');
	return {
		startTime: now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate(),
		endTime: now.toDate(),
		type: 'fixed' as 'fixed',
		label: DEFAULT_FIXED_DURATIONS.name,
	};
};

const defaultQuickFilters = {
	search: '',
	filters: {},
	sort: {
		key: 'p_timestamp',
		order: SortOrder.DESCENDING,
	},
};

const defaultLiveTailConfig = {
	liveTailStatus: '' as '',
	liveTailSchemaData: [],
	liveTailSearchValue: '',
	liveTailSearchField: '',
};

type LogsStore = {
	timeRange: TimeRange;
	quickFilters: QuickFilters;
	liveTailConfig: LiveTailConfig;
	refreshInterval: number | null;
};

type LogsStoreReducers = {
	setTimeRange: (store: LogsStore, payload: Partial<TimeRange>) => ReducerOutput;
	resetTimeRange: () => ReducerOutput;
	deleteFilterItem: (store: LogsStore, key: string) => ReducerOutput;
	addFilterItem: (store: LogsStore, key: string, value: string[]) => ReducerOutput;
	setLiveTailStatus: (store: LogsStore, liveTailStatus: LiveTailStatus) => ReducerOutput;
	resetLiveTailSearchState: (store: LogsStore) => ReducerOutput;
	setLiveTailSchema: (store: LogsStore, liveTailSchemaData: LogStreamData) => ReducerOutput;
	setRefreshInterval: (store: LogsStore, interval: number | null) => ReducerOutput;
};

const initialState: LogsStore = {
	timeRange: getDefaultTimeRange(),
	quickFilters: defaultQuickFilters,
	liveTailConfig: defaultLiveTailConfig,
	refreshInterval: null
};

const { Provider: LogsProvider, useStore: useLogsStore } = createFastContext(initialState);

// reducers
const setTimeRange = (store: LogsStore, payload: Partial<TimeRange>) => {
	return { timeRange: { ...store.timeRange, ...payload } };
};

const resetTimeRange = () => {
	return { timeRange: getDefaultTimeRange() };
};

const deleteFilterItem = (store: LogsStore, key: string) => {
	const filters = store.quickFilters.filters;
	const updatedFilters = (({ [key]: _, ...filters }) => filters)(filters);
	return { quickFilters: { ...store.quickFilters, filters: updatedFilters } };
};

const addFilterItem = (store: LogsStore, key: string, value: string[]) => {
	const filters = store.quickFilters.filters;
	const updatedFilters = { ...filters, [key]: value };
	return { quickFilters: { ...store.quickFilters, filters: updatedFilters } };
};

const setLiveTailStatus = (store: LogsStore, liveTailStatus: LiveTailStatus) => {
	const { liveTailConfig } = store;
	return { liveTailConfig: { ...liveTailConfig, liveTailStatus } };
};

const resetLiveTailSearchState = (store: LogsStore) => {
	return { liveTailConfig: { ...store.liveTailConfig, liveTailSearchValue: '', liveTailSearchField: '' } };
};

const setLiveTailSchema = (store: LogsStore, liveTailSchemaData: LogStreamData) => {
	return { liveTailConfig: { ...store.liveTailConfig, liveTailSchemaData } };
};

const setRefreshInterval = (_store: LogsStore, interval: number | null) => {
	return { refreshInterval: interval};
}

const logsStoreReducers: LogsStoreReducers = {
	setTimeRange,
	resetTimeRange,
	deleteFilterItem,
	addFilterItem,
	setLiveTailStatus,
	resetLiveTailSearchState,
	setLiveTailSchema,
	setRefreshInterval
};

export { LogsProvider, useLogsStore, logsStoreReducers };
