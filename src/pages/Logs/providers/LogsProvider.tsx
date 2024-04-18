import { Log } from '@/@types/parseable/api/query';
import { LogStreamData, LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import initContext from '@/utils/initContext';
import dayjs from 'dayjs';
import { addOrRemoveElement } from '@/utils';
import { getPageSlice, makeHeadersFromSchema, makeHeadersfromData } from '../utils';

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

const defaultCustQuerySearchState = {
	showQueryEditor: false,
	isQuerySearchActive: false,
	custSearchQuery: '',
	mode: 'filters',
	viewMode: 'filters',
};

type LogQueryData = {
	rawData: Log[];
	filteredData: Log[];
};

type CustQuerySearchState = {
	showQueryEditor: boolean;
	isQuerySearchActive: boolean;
	custSearchQuery: string;
	mode: string;
	viewMode: string;
};

type LogsStore = {
	timeRange: TimeRange;
	quickFilters: QuickFilters;
	liveTailConfig: LiveTailConfig;
	refreshInterval: number | null;
	selectedLog: Log | null;
	custQuerySearchState: CustQuerySearchState;

	modalOpts: {
		deleteModalOpen: boolean,
		alertsModalOpen: boolean,
		retentionModalOpen: boolean,
		queryBuilderModalOpen: boolean,
	},

	tableOpts: {
		disabledColumns: string[];
		pinnedColumns: string[];
		pageData: Log[];
		totalPages: number;
		totalCount: number;
		displayedCount: number;
		currentPage: number;
		perPage: number;
		currentOffset: number;
		headers: string[];
	}

	data: LogQueryData & {
		schema: LogStreamSchemaData | null
	};
};

type LogsStoreReducers = {
	setTimeRange: (store: LogsStore, payload: Partial<TimeRange>) => ReducerOutput;
	resetTimeRange: (store: LogsStore) => ReducerOutput;
	deleteFilterItem: (store: LogsStore, key: string) => ReducerOutput;
	addFilterItem: (store: LogsStore, key: string, value: string[]) => ReducerOutput;
	setLiveTailStatus: (store: LogsStore, liveTailStatus: LiveTailStatus) => ReducerOutput;
	resetLiveTailSearchState: (store: LogsStore) => ReducerOutput;
	setLiveTailSchema: (store: LogsStore, liveTailSchemaData: LogStreamData) => ReducerOutput;
	setRefreshInterval: (store: LogsStore, interval: number | null) => ReducerOutput;
	resetQuickFilters: (store: LogsStore) => ReducerOutput;
	streamChangeCleanup: (store: LogsStore) => ReducerOutput;
	toggleQueryEditor: (store: LogsStore) => ReducerOutput;
	resetCustQuerySearchState: (store: LogsStore) => ReducerOutput;
	setCustQuerySearchState: (store: LogsStore, payload: Partial<CustQuerySearchState>) => ReducerOutput;
	toggleCustQuerySearchMode: (store: LogsStore) => ReducerOutput;
	toggleDeleteModal: (store: LogsStore) => ReducerOutput;
	toggleAlertsModal: (store: LogsStore) => ReducerOutput;
	toggleRetentionModal: (store: LogsStore) => ReducerOutput;

	// table opts reducers
	toggleDisabledColumns: (store: LogsStore, columnName: string) => ReducerOutput;
	togglePinnedColumns: (store: LogsStore, columnName: string) => ReducerOutput;
	setCurrentOffset: (store: LogsStore, offset: number) => ReducerOutput;
	setPerPage: (store: LogsStore, perPage: number) => ReducerOutput;
	setCurrentPage: (store: LogsStore, page: number) => ReducerOutput;
	setTotalCount: (store: LogsStore, totalCount: number) => ReducerOutput;
	setPageAndPageData: (store: LogsStore, pageNo: number) => ReducerOutput;

	// data reducers
	setData: (store: LogsStore, newData: {rawData?: Log[], filteredData?: Log[]}) => ReducerOutput;
	setStreamSchema: (store: LogsStore, schema: LogStreamSchemaData) => ReducerOutput;
};

const initialState: LogsStore = {
	timeRange: getDefaultTimeRange(),
	quickFilters: defaultQuickFilters,
	liveTailConfig: defaultLiveTailConfig,
	refreshInterval: null,
	selectedLog: null,
	custQuerySearchState: defaultCustQuerySearchState,

	modalOpts: {
		deleteModalOpen: false,
		alertsModalOpen: false,
		retentionModalOpen: false,
		queryBuilderModalOpen: false,
	},

	tableOpts: {
		disabledColumns: [],
		pinnedColumns: [],
		pageData: [],
		perPage: 30,
		totalCount: 0,
		displayedCount: 0,
		totalPages: 300,
		currentPage: 0,
		currentOffset: 0,
		headers: [],
	},

	// data
	data: {
		rawData: [],
		filteredData: [],
		schema: null,
	},
	// if adding new fields, verify streamChangeCleanup
};

const { Provider: LogsProvider, useStore: useLogsStore } = initContext(initialState);

// reducers
const setTimeRange = (store: LogsStore, payload: Partial<TimeRange>) => {
	return { timeRange: { ...store.timeRange, ...payload } };
};

const resetTimeRange = (store: LogsStore) => {
	const now = dayjs();
	const timeDiff = store.timeRange.endTime.getTime() - store.timeRange.startTime.getTime();
	const startTime = now.subtract(timeDiff).toDate();
	const endTime = now.toDate();
	return store.timeRange.type === 'custom' ? store : { timeRange: { ...store.timeRange, startTime, endTime } };
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

const resetQuickFilters = (_store: LogsStore) => {
	return { quickFilters: defaultQuickFilters };
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
	return { refreshInterval: interval };
};

const streamChangeCleanup = (_store: LogsStore) => {
	return { ...initialState };
};

const toggleQueryEditor = (store: LogsStore) => {
	const { custQuerySearchState } = store;
	return { custQuerySearchState: { ...custQuerySearchState, showQueryEditor: !custQuerySearchState.showQueryEditor } };
};

const resetCustQuerySearchState = (store: LogsStore) => {
	const { custQuerySearchState } = store;
	return { custQuerySearchState: { ...defaultCustQuerySearchState, viewMode: custQuerySearchState.viewMode } };
};

const setCustQuerySearchState = (store: LogsStore, payload: Partial<CustQuerySearchState>) => {
	const { custQuerySearchState } = store;
	return {
		custQuerySearchState: { ...custQuerySearchState, ...payload, isQuerySearchActive: true, showQueryEditor: false },
	};
};

const toggleCustQuerySearchMode = (store: LogsStore) => {
	const { custQuerySearchState } = store;
	const targetMode = custQuerySearchState.viewMode === 'filters' ? 'sql' : 'filters';
	return {
		custQuerySearchState: { ...custQuerySearchState, viewMode: targetMode },
	};
};

const toggleDeleteModal = (store: LogsStore) => {
	const { modalOpts } = store;
	return { modalOpts: { ...modalOpts, deleteModalOpen: !modalOpts.deleteModalOpen } };
};

const toggleRetentionModal = (store: LogsStore) => {
	const { modalOpts } = store;
	return { modalOpts: { ...modalOpts, retentionModalOpen: !modalOpts.retentionModalOpen } };
};

const toggleAlertsModal = (store: LogsStore) => {
	const { modalOpts } = store;
	return { modalOpts: { ...modalOpts, alertsModalOpen: !modalOpts.alertsModalOpen } };
};

const toggleDisabledColumns = (store: LogsStore, columnName: string) => {
	const { tableOpts } = store;
	return {
		tableOpts: {
			...tableOpts,
			disabledColumns:  addOrRemoveElement(tableOpts.disabledColumns, columnName),
		}
	};
};

const togglePinnedColumns = (store: LogsStore, columnName: string) => {
	const { tableOpts } = store;
	return {
		tableOpts: {
			...tableOpts,
			pinnedColumns:  addOrRemoveElement(tableOpts.pinnedColumns, columnName),
		}
	};
};

const setData = (store: LogsStore, newData: {rawData?: Log[], filteredData?: Log[]}) => {
	const { data: existingData, custQuerySearchState, tableOpts } = store;
	const { rawData, filteredData } = newData;
	const currentPage = tableOpts.currentPage === 0 ? 1 : tableOpts.currentPage
	const newPageSlice = filteredData && getPageSlice(currentPage, tableOpts.perPage, filteredData);

	// only if pageoffset is 1
	const newHeaders =
		filteredData && existingData.schema && custQuerySearchState.isQuerySearchActive
			? makeHeadersfromData(existingData.schema, custQuerySearchState.custSearchQuery)
			: makeHeadersFromSchema(existingData.schema);

	return {
		tableOpts: {
			...store.tableOpts,
			...(newPageSlice ? { pageData: newPageSlice } : {}),
			...(newHeaders ? { headers: newHeaders } : {}),
			currentPage
		},
		data: { ...existingData, ...(rawData ? { rawData } : {}), ...(filteredData ? { filteredData } : {}) },
	};
}

const setStreamSchema = (store: LogsStore, schema: LogStreamSchemaData) => {
	return {
		data: {
			...store.data,
			schema
		}
	}
}

const setPerPage = (store: LogsStore, perPage: number) => {
	return {
		tableOpts: {
			...store.tableOpts,
			perPage,
		},
	};
}

const setCurrentPage = (store: LogsStore, currentPage: number) => {
	return {
		tableOpts: {
			...store.tableOpts,
			currentPage,
		},
	};
};

const setCurrentOffset = (store: LogsStore, currentOffset: number) => {
	return {
		tableOpts: {
			...store.tableOpts,
			currentOffset,
		},
	};
};

const setTotalCount = (store: LogsStore, totalCount: number) => {
	return {
		tableOpts: {
			...store.tableOpts,
			totalCount,
		},
	};
};

const setPageAndPageData = (store: LogsStore, pageNo: number) => {
	const {
		data: { filteredData },
		tableOpts,
	} = store;
	const newPageSlice = filteredData && getPageSlice(pageNo, tableOpts.perPage, filteredData);

	return {
		tableOpts: {
			...store.tableOpts,
			pageData: newPageSlice,
			currentPage: pageNo,
		},
	};
};

const logsStoreReducers: LogsStoreReducers = {
	setTimeRange,
	resetTimeRange,
	deleteFilterItem,
	addFilterItem,
	setLiveTailStatus,
	resetLiveTailSearchState,
	setLiveTailSchema,
	setRefreshInterval,
	resetQuickFilters,
	streamChangeCleanup,
	toggleQueryEditor,
	resetCustQuerySearchState,
	setCustQuerySearchState,
	toggleCustQuerySearchMode,
	toggleAlertsModal,
	toggleRetentionModal,
	toggleDeleteModal,
	toggleDisabledColumns,
	togglePinnedColumns,
	setData,
	setStreamSchema,
	setPerPage,
	setCurrentPage,
	setCurrentOffset,
	setTotalCount,
	setPageAndPageData
};

export { LogsProvider, useLogsStore, logsStoreReducers };
