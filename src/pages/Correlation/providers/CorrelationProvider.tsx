import { getPageSlice } from '@/pages/Stream/utils';
import initContext from '@/utils/initContext';
import { Log } from '@/@types/parseable/api/query';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import _ from 'lodash';

export const CORRELATION_LOAD_LIMIT = 250;

export const STREAM_COLORS = ['#FDA4AF', '#D8B4FE'];
export const STREAM_HEADER_COLORS = ['#9F1239', '#7E22CE'];
export const FIELD_BACKGROUND_COLORS = ['#FFF8F8', '#F8F1FF'];
export const DATA_TYPE_COLORS = ['#B68A96', '#AB92C0'];

const defaultSortKey = 'p_timestamp';
const defaultSortOrder = 'desc' as 'desc';

type ReducerOutput = {
	streamData?: Record<string, any>;
	fields?: Record<string, any>;
	joins?: Record<string, any>;
	tableOpts?: any;
	selectedFields?: any;
};

type CorrelationStore = {
	streamData: Record<string, { logData: Log[] } | null>;
	fields: Record<
		string,
		{
			fieldTypeMap: Record<string, 'text' | 'number' | 'timestamp'>;
			color: string;
			headerColor: string;
			backgroundColor: string;
			iconColor: string;
		}
	>;
	selectedFields: Record<string, string[]>;
	correlationCondition: string;
	joins: Record<string, string[]>;
	tableOpts: {
		disabledColumns: string[];
		wrapDisabledColumns: string[];
		pinnedColumns: string[];
		pageData: Log[];
		totalPages: number;
		totalCount: number;
		displayedCount: number;
		currentPage: number;
		perPage: number;
		currentOffset: number;
		headers: string[];
		orderedHeaders: string[];
		sortKey: string;
		sortOrder: 'asc' | 'desc';
		filters: Record<string, string[]>;
		instantSearchValue: string;
		configViewType: 'schema' | 'columns';
		enableWordWrap: boolean;
	};
};

type CorrelationStoreReducers = {
	setStreamData: (store: CorrelationStore, currentStream: string, data: Log[]) => ReducerOutput;
	deleteStreamData: (store: CorrelationStore, currentStream: string) => ReducerOutput;
	setSelectedFields: (store: CorrelationStore, field: string, streamName: string) => ReducerOutput;
	setJoinFields: (store: CorrelationStore, field: string, streamName: string) => ReducerOutput;
	deleteSelectedField: (store: CorrelationStore, field: string, streamName: string) => ReducerOutput;
	setStreamSchema: (store: CorrelationStore, schema: LogStreamSchemaData, streamName: string) => ReducerOutput;
	setCurrentOffset: (store: CorrelationStore, offset: number) => ReducerOutput;
	setCurrentPage: (store: CorrelationStore, page: number) => ReducerOutput;
	setCorrelationCondition: (store: CorrelationStore, correlationCondition: string) => ReducerOutput;
	setPageAndPageData: (store: CorrelationStore, pageNo: number, perPage?: number) => ReducerOutput;
};

const initialState: CorrelationStore = {
	streamData: {},
	fields: {},
	selectedFields: {},
	correlationCondition: '',
	joins: {},
	tableOpts: {
		disabledColumns: [],
		wrapDisabledColumns: [],
		pinnedColumns: [],
		pageData: [],
		perPage: 50,
		totalCount: 0,
		displayedCount: 0,
		totalPages: 0,
		currentPage: 0,
		currentOffset: 0,
		headers: [],
		orderedHeaders: [],
		sortKey: defaultSortKey,
		sortOrder: defaultSortOrder,
		filters: {},
		instantSearchValue: '',
		configViewType: 'columns',
		enableWordWrap: true,
	},
};

const setJoinFields = (store: CorrelationStore, field: string, streamName: string): ReducerOutput => {
	const updatedJoinFields = {
		...store.joins,
		[streamName]: store.joins[streamName]
			? store.joins[streamName].includes(field)
				? store.joins[streamName]
				: [...store.joins[streamName], field]
			: [field],
	};

	return {
		...store,
		joins: updatedJoinFields,
	};
};

const setSelectedFields = (store: CorrelationStore, field: string, streamName: string): ReducerOutput => {
	const { tableOpts } = store;
	const updatedSelectedFields = {
		...store.selectedFields,
		[streamName]: store.selectedFields[streamName]
			? store.selectedFields[streamName].includes(field)
				? store.selectedFields[streamName]
				: [...store.selectedFields[streamName], field]
			: [field],
	};

	const currentPage = 1;
	const filteredData = filterAndSortData(tableOpts, store.streamData[streamName]?.logData || []);
	const newPageSlice = filteredData && getPageSlice(currentPage, tableOpts.perPage, filteredData);

	// Compute updated pageData with slicing logic
	const updatedPageData = newPageSlice?.map((_record, index) => {
		const combinedRecord: any = {};

		for (const [stream, fields] of Object.entries(updatedSelectedFields)) {
			const streamRecord = filteredData[index];
			if (streamRecord) {
				if (Array.isArray(fields)) {
					fields.forEach((field) => {
						combinedRecord[`${stream}.${field}`] = streamRecord[field];
					});
				}
			}
		}

		return combinedRecord;
	});

	// Return updated store
	return {
		...store,
		selectedFields: updatedSelectedFields,
		tableOpts: {
			...store.tableOpts,
			pageData: updatedPageData || [],
			currentPage,
			totalPages: getTotalPages(filteredData, tableOpts.perPage),
		},
	};
};

const setPageAndPageData = (store: CorrelationStore, pageNo: number, perPage?: number) => {
	const { tableOpts, selectedFields, streamData } = store;
	const streamNames = Object.keys(selectedFields);

	const combinedFilteredData = streamNames.flatMap((streamName) => {
		return streamData[streamName]?.logData || [];
	});

	if (!combinedFilteredData.length) {
		return {
			...store,
			tableOpts: {
				...store.tableOpts,
				pageData: [],
				currentPage: pageNo,
				totalPages: 0,
				perPage: perPage || tableOpts.perPage,
			},
		};
	}

	const updatedPerPage = perPage || tableOpts.perPage;
	const newPageSlice = getPageSlice(pageNo, updatedPerPage, combinedFilteredData);
	const updatedPageData = newPageSlice?.map((record) => {
		const combinedRecord: any = {};

		// Iterate over all streams and selected fields
		streamNames.forEach((stream) => {
			const fields = selectedFields[stream];
			const streamRecord = record;

			if (streamRecord && Array.isArray(fields)) {
				fields.forEach((field) => {
					// Combine the stream and field into a single record
					combinedRecord[`${stream}.${field}`] = streamRecord[field];
				});
			}
		});

		return combinedRecord;
	});

	return {
		...store,
		tableOpts: {
			...store.tableOpts,
			pageData: updatedPageData || [],
			currentPage: pageNo,
			totalPages: getTotalPages(combinedFilteredData, updatedPerPage),
			perPage: updatedPerPage,
		},
	};
};

const deleteSelectedField = (store: CorrelationStore, field: string, streamName: string) => {
	if (!store.selectedFields[streamName]) {
		return store;
	}

	const updatedFields = store.selectedFields[streamName].filter((selectedField: string) => selectedField !== field);

	const newSelectedFields = { ...store.selectedFields };

	if (updatedFields.length > 0) {
		newSelectedFields[streamName] = updatedFields;
	} else {
		delete newSelectedFields[streamName];
	}

	// Delete from the pageData as well
	const updatedPageData = store.tableOpts.pageData.map((row: any) => {
		const newRow = { ...row };
		delete newRow[`${streamName}.${field}`];
		return newRow;
	});

	return {
		...store,
		selectedFields: newSelectedFields,
		tableOpts: {
			...store.tableOpts,
			pageData: updatedPageData,
		},
	};
};

const filterAndSortData = (
	opts: { sortOrder: 'asc' | 'desc'; sortKey: string; filters: Record<string, string[]> },
	data: Log[],
) => {
	const { sortOrder, sortKey, filters } = opts;
	const filteredData = _.isEmpty(filters)
		? data
		: (_.reduce(
				data,
				(acc: Log[], d: Log) => {
					const doesMatch = _.some(filters, (value, key) => _.includes(value, _.toString(d[key])));
					return doesMatch ? [...acc, d] : acc;
				},
				[],
		  ) as Log[]);
	const sortedData = _.orderBy(filteredData, [sortKey], [sortOrder]);
	return sortedData;
};

const setStreamData = (store: CorrelationStore, currentStream: string, data: Log[]): ReducerOutput => {
	if (!currentStream) {
		return { fields: store.fields };
	}

	const currentStreamCount = Object.keys(store.streamData || {}).length;
	if (currentStreamCount >= 2 && !(currentStream in store.streamData)) {
		console.warn('Stream limit reached. Cannot add more than 2 streams.');
		return store;
	}

	// Update streamData
	const updatedStreamData = {
		...store.streamData,
		[currentStream]: {
			logData: data,
		},
	};

	// Recompute filtered and sliced data for the table
	const filteredData = filterAndSortData(store.tableOpts, updatedStreamData[currentStream]?.logData || []);
	const currentPage = store.tableOpts.currentPage || 1;
	const newPageSlice = filteredData && getPageSlice(currentPage, store.tableOpts.perPage, filteredData);

	// Rebuild `pageData` based on `selectedFields`
	const updatedPageData = newPageSlice?.map((_record, index) => {
		const combinedRecord: any = {};

		for (const [stream, fields] of Object.entries(store.selectedFields)) {
			const streamRecord = filteredData[index];
			if (streamRecord) {
				if (Array.isArray(fields)) {
					fields.forEach((field) => {
						combinedRecord[`${stream}.${field}`] = streamRecord[field];
					});
				}
			}
		}

		return combinedRecord;
	});

	// Update the store with new data
	return {
		...store,
		streamData: updatedStreamData,
		tableOpts: {
			...store.tableOpts,
			pageData: updatedPageData || [],
			currentPage,
			totalPages: getTotalPages(filteredData, store.tableOpts.perPage),
		},
	};
};

const setCorrelationCondition = (store: CorrelationStore, correlationCondition: string) => {
	return {
		...store,
		correlationCondition,
	};
};

const getTotalPages = (data: Log[], perPage: number) => {
	return _.isEmpty(data) ? 0 : Math.ceil(_.size(data) / perPage);
};

const setCurrentOffset = (store: CorrelationStore, currentOffset: number) => {
	return {
		tableOpts: {
			...store.tableOpts,
			currentOffset,
		},
	};
};

const setCurrentPage = (store: CorrelationStore, currentPage: number) => {
	return {
		tableOpts: {
			...store.tableOpts,
			currentPage,
		},
	};
};

const parseType = (type: any): 'text' | 'number' | 'timestamp' => {
	if (typeof type === 'object') {
		if (type && type.Timestamp) {
			return 'timestamp';
		}
		return 'text'; // Default to text for any other object types
	}

	const lowercaseType = (type || '').toLowerCase();
	if (lowercaseType.startsWith('int') || lowercaseType.startsWith('float') || lowercaseType.startsWith('double')) {
		return 'number';
	} else {
		return 'text';
	}
};

const setStreamSchema = (store: CorrelationStore, schema: LogStreamSchemaData, streamName: string): ReducerOutput => {
	const fieldTypeMap = schema.fields.reduce((acc, field) => {
		return { ...acc, [field.name]: parseType(field.data_type) };
	}, {});

	const currentStreamCount = Object.keys(store.fields || {}).length;

	return {
		fields: {
			...store.fields,
			[streamName]: {
				fieldTypeMap,
				color: STREAM_COLORS[currentStreamCount],
				headerColor: STREAM_HEADER_COLORS[currentStreamCount],
				backgroundColor: FIELD_BACKGROUND_COLORS[currentStreamCount],
				iconColor: DATA_TYPE_COLORS[currentStreamCount],
			},
		},
	};
};

const deleteStreamData = (store: CorrelationStore, currentStream: string) => {
	const newfields = { ...store.fields };
	const newStreamData = { ...store.streamData };

	if (currentStream in newfields) {
		delete newfields[currentStream];
		delete newStreamData[currentStream];
	}

	return {
		fields: newfields,
		streamData: newStreamData,
	};
};

const { Provider: CorrelationProvider, useStore: useCorrelationStore } = initContext(initialState);

const correlationStoreReducers: CorrelationStoreReducers = {
	setStreamData,
	deleteStreamData,
	setSelectedFields,
	deleteSelectedField,
	setStreamSchema,
	setCurrentOffset,
	setCurrentPage,
	setPageAndPageData,
	setJoinFields,
	setCorrelationCondition,
};

export { CorrelationProvider, useCorrelationStore, correlationStoreReducers };
