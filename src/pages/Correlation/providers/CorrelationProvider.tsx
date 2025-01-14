import { getPageSlice } from '@/pages/Stream/utils';
import initContext from '@/utils/initContext';
import { Log, LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import _ from 'lodash';
import { QueryType } from '@/pages/Stream/providers/FilterProvider';
import { FilterQueryBuilder } from '@/utils/queryBuilder';
import { formatQuery } from 'react-querybuilder';
import { Correlation } from '@/@types/parseable/api/correlation';

export const CORRELATION_LOAD_LIMIT = 1000;

export const STREAM_COLORS = ['#FDA4AF', '#c084fc'];
export const STREAM_HEADER_COLORS = ['#9F1239', '#7E22CE'];
export const FIELD_BACKGROUND_COLORS = ['#FFF8F8', '#F8F1FF'];
export const DATA_TYPE_COLORS = ['#B68A96', '#AB92C0'];

const defaultSortKey = 'p_timestamp';
const defaultSortOrder = 'desc' as const;

type ReducerOutput = {
	streamData?: Record<string, any>;
	fields?: Record<string, any>;
	joins?: Record<string, any>;
	tableOpts?: any;
	selectedFields?: any;
	isCorrelatedData?: boolean;
};

type CorrelationStore = {
	streamData: Record<string, { logData: Log[]; eventTimeData: LogsResponseWithHeaders[] } | null>;
	fields: Record<
		string,
		{
			fieldTypeMap: Record<string, 'text' | 'number' | 'timestamp' | 'list' | 'boolean'>;
			color: string;
			headerColor: string;
			backgroundColor: string;
			iconColor: string;
		}
	>;
	selectedFields: Record<string, string[]>;
	correlationCondition: string;
	isCorrelatedData: boolean;
	allPageData: any;
	correlationId: string;
	savedCorrelationId: string;
	correlations: Correlation[] | null;
	activeCorrelation: Correlation | null;
	isSavedCorrelationsModalOpen: boolean;
	isSaveCorrelationModalOpen: boolean;
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
	setSelectedFields: (store: CorrelationStore, field: string, streamName: string, clearAll?: boolean) => ReducerOutput;
	deleteSelectedField: (store: CorrelationStore, field: string, streamName: string) => ReducerOutput;
	setStreamSchema: (store: CorrelationStore, schema: LogStreamSchemaData, streamName: string) => ReducerOutput;
	setCurrentOffset: (store: CorrelationStore, offset: number) => ReducerOutput;
	setCurrentPage: (store: CorrelationStore, page: number) => ReducerOutput;
	setCorrelationCondition: (store: CorrelationStore, correlationCondition: string) => ReducerOutput;
	setPageAndPageData: (store: CorrelationStore, pageNo: number, perPage?: number) => ReducerOutput;
	setIsCorrelatedFlag: (store: CorrelationStore, flag: boolean) => ReducerOutput;
	parseQuery: (query: QueryType, currentStream: string) => { where: string; parsedQuery: string };
	setCorrelationId: (store: CorrelationStore, id: string) => ReducerOutput;
	setCorrelations: (store: CorrelationStore, correlations: Correlation[]) => ReducerOutput;
	toggleSavedCorrelationsModal: (_store: CorrelationStore, val: boolean) => ReducerOutput;
	setActiveCorrelation: (_store: CorrelationStore, correlation: Correlation | null) => ReducerOutput;
	toggleSaveCorrelationModal: (_store: CorrelationStore, val: boolean) => ReducerOutput;
	cleanCorrelationStore: (store: CorrelationStore) => ReducerOutput;
	setSavedCorrelationId: (store: CorrelationStore, id: string) => ReducerOutput;
};

const initialState: CorrelationStore = {
	streamData: {},
	fields: {},
	selectedFields: {},
	correlationCondition: '',
	isCorrelatedData: false,
	allPageData: [],
	correlationId: '',
	savedCorrelationId: '',
	correlations: null,
	activeCorrelation: null,
	isSavedCorrelationsModalOpen: false,
	isSaveCorrelationModalOpen: false,
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

// Utilites

const parseQuery = (query: QueryType, currentStream: string) => {
	// todo - custom rule processor to prevent converting number strings into numbers for text fields
	const where = formatQuery(query, { format: 'sql', parseNumbers: true, quoteFieldNamesWith: ['"', '"'] });
	const timeRangeCondition = '(1=1)';

	const filterQueryBuilder = new FilterQueryBuilder({
		streamName: currentStream,
		whereClause: where,
		timeRangeCondition,
		limit: CORRELATION_LOAD_LIMIT,
	});
	return { where, parsedQuery: filterQueryBuilder.getQuery() };
};

export const filterAndSortData = (
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

// Helpers

const updateSelectedFields = (store: CorrelationStore, field: string, streamName: string, clearAll: boolean) => {
	return clearAll
		? {}
		: {
				...store.selectedFields,
				[streamName]: store.selectedFields[streamName]?.includes(field)
					? store.selectedFields[streamName]
					: [...(store.selectedFields[streamName] || []), field],
		  };
};

const generatePageData = (store: CorrelationStore, updatedSelectedFields: Record<string, string[]>) => {
	return Array.from({ length: store.tableOpts.perPage })
		.map((_record, index) => {
			const combinedRecord: Record<string, any> = {};

			Object.entries(updatedSelectedFields).forEach(([stream, fields]) => {
				const streamData = filterAndSortData(store.tableOpts, store.streamData[stream]?.logData || []);
				const streamRecord = streamData[index];

				if (streamRecord && Array.isArray(fields)) {
					fields.forEach((field) => {
						combinedRecord[`${stream}.${field}`] = streamRecord[field];
					});
				}
			});

			return combinedRecord;
		})
		.filter(Boolean);
};

const updateStreamPageData = (
	store: CorrelationStore,
	currentPage: number,
	updatedStreamData: Record<string, { logData: Log[] } | null>,
) => {
	const updatedPageData: Record<string, any>[] = [];
	Object.entries(store.selectedFields).forEach(([stream, fields]) => {
		const streamData = filterAndSortData(store.tableOpts, updatedStreamData[stream]?.logData || []);
		const streamPageSlice = getPageSlice(currentPage, store.tableOpts.perPage, streamData);

		streamPageSlice.forEach((record, index) => {
			if (!updatedPageData[index]) updatedPageData[index] = {};
			if (Array.isArray(fields)) {
				fields.forEach((field) => {
					updatedPageData[index][`${stream}.${field}`] = record[field];
				});
			}
		});
	});
	return updatedPageData;
};

const generatePaginatedPageData = (
	store: CorrelationStore,
	updatedSelectedFields: Record<string, string[]>,
	pageNo: number,
	perPage: number,
) => {
	const startIndex = (pageNo - 1) * perPage;

	return Array.from({ length: perPage })
		.map((_record, offset) => {
			const index = startIndex + offset;
			const combinedRecord: Record<string, any> = {};

			Object.entries(updatedSelectedFields).forEach(([stream, fields]) => {
				const streamData = filterAndSortData(store.tableOpts, store.streamData[stream]?.logData || []);
				const streamRecord = streamData[index];

				if (streamRecord && Array.isArray(fields)) {
					fields.forEach((field) => {
						combinedRecord[`${stream}.${field}`] = streamRecord[field];
					});
				}
			});

			return combinedRecord;
		})
		.filter(Boolean);
};

// Reducer Functions

const cleanCorrelationStore = (store: CorrelationStore) => {
	return {
		...store,
		selectedFields: {},
		correlationCondition: '',
		correlationId: '',
		isCorrelatedData: false,
		fields: {},
	};
};

const toggleSaveCorrelationModal = (store: CorrelationStore, val: boolean) => {
	return {
		...store,
		isSaveCorrelationModalOpen: val,
	};
};

const toggleSavedCorrelationsModal = (store: CorrelationStore, val: boolean) => {
	return {
		...store,
		isSavedCorrelationsModalOpen: val,
	};
};

const setCorrelations = (store: CorrelationStore, correlations: Correlation[]) => {
	return {
		...store,
		correlations,
	};
};

const setActiveCorrelation = (store: CorrelationStore, correlation: Correlation | null) => {
	return {
		...store,
		activeCorrelation: correlation,
	};
};

const setSavedCorrelationId = (store: CorrelationStore, id: string) => {
	return {
		...store,
		savedCorrelationId: id,
	};
};
const setCorrelationId = (store: CorrelationStore, id: string) => {
	return {
		...store,
		correlationId: id,
	};
};

const setIsCorrelatedFlag = (store: CorrelationStore, flag: boolean) => {
	return {
		...store,
		isCorrelatedData: flag,
	};
};
const setSelectedFields = (
	store: CorrelationStore,
	field: string,
	streamName: string,
	clearAll = false,
): ReducerOutput => {
	const updatedSelectedFields = updateSelectedFields(store, field, streamName, clearAll);
	const currentPage = 1;

	const updatedPageData = store.isCorrelatedData
		? store.tableOpts.pageData
		: generatePageData(store, updatedSelectedFields);

	return {
		...store,
		selectedFields: updatedSelectedFields,
		tableOpts: {
			...store.tableOpts,
			pageData: updatedPageData || [],
			currentPage,
			totalPages: getTotalPages(
				filterAndSortData(store.tableOpts, store.streamData[streamName]?.logData || []),
				store.tableOpts.perPage,
			),
		},
	};
};

const setPageAndPageData = (store: CorrelationStore, pageNo: number, perPage?: number): ReducerOutput => {
	const { tableOpts, selectedFields, streamData, isCorrelatedData } = store;
	const updatedPerPage = perPage || tableOpts.perPage;

	const updatedPageData = generatePaginatedPageData(store, selectedFields, pageNo, updatedPerPage);

	if (!updatedPageData.length) {
		return {
			...store,
			tableOpts: {
				...tableOpts,
				pageData: [],
				currentPage: pageNo,
				totalPages: 0,
				perPage: perPage || tableOpts.perPage,
			},
		};
	}

	if (isCorrelatedData) {
		const filteredData = filterAndSortData(tableOpts, streamData['correlatedStream']?.logData || []);
		return {
			...store,
			tableOpts: {
				...tableOpts,
				currentPage: pageNo,
				perPage: updatedPerPage,
				pageData: getPageSlice(pageNo, updatedPerPage, filteredData),
				totalPages: getTotalPages(filteredData, updatedPerPage),
			},
		};
	}

	const totalPages = Math.max(
		...Object.values(streamData).map((stream) =>
			_.isEmpty(stream?.logData) ? 0 : Math.ceil(_.size(stream?.logData) / updatedPerPage),
		),
	);

	return {
		...store,
		tableOpts: {
			...tableOpts,
			pageData: updatedPageData || [],
			currentPage: pageNo,
			perPage: updatedPerPage,
			totalPages,
		},
	};
};

const deleteSelectedField = (store: CorrelationStore, field: string, streamName: string): ReducerOutput => {
	if (!store.selectedFields[streamName]) return store;

	const updatedFields = store.selectedFields[streamName].filter((selectedField) => selectedField !== field);

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

const setStreamData = (store: CorrelationStore, currentStream: string, data: Log[]): ReducerOutput => {
	if (!currentStream) return { fields: store.fields };
	// Update streamData
	const updatedStreamData = {
		...store.streamData,
		[currentStream]: { logData: data },
	};
	// Recompute filtered and sliced data for the table
	const filteredData = filterAndSortData(store.tableOpts, updatedStreamData[currentStream]?.logData || []);
	const currentPage = 1;

	if (store.isCorrelatedData) {
		return {
			...store,
			streamData: updatedStreamData,
			tableOpts: {
				...store.tableOpts,
				pageData: getPageSlice(currentPage, store.tableOpts.perPage, filteredData),
				currentPage,
				totalPages: getTotalPages(filteredData, store.tableOpts.perPage),
			},
		};
	}
	// Rebuild `pageData` based on `selectedFields`
	const updatedPageData = updateStreamPageData(store, currentPage, updatedStreamData);

	// Update the store with new data
	return {
		...store,
		streamData: updatedStreamData,
		tableOpts: {
			...store.tableOpts,
			pageData: updatedPageData,
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

const parseType = (type: any): 'text' | 'number' | 'timestamp' | 'list' | 'boolean' => {
	if (typeof type === 'object') {
		if (type && type.Timestamp) {
			return 'timestamp';
		} else if (type.List) {
			return 'list';
		}
		return 'text'; // Default to text for any other object types
	}

	const lowercaseType = (type || '').toLowerCase();
	if (lowercaseType.startsWith('int') || lowercaseType.startsWith('float') || lowercaseType.startsWith('double')) {
		return 'number';
	} else if (lowercaseType.startsWith('bool')) {
		return 'boolean';
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
	const newSelectedFields = { ...store.selectedFields };

	// Remove the currentStream from fields, streamData, and selectedFields
	if (currentStream in newfields) {
		delete newfields[currentStream];
		delete newStreamData[currentStream];
		delete newSelectedFields[currentStream];
	}

	// Reassign colors to the remaining streams based on their new order
	const updatedFields = Object.keys(newfields)
		.map((streamName, index) => ({
			[streamName]: {
				...newfields[streamName],
				color: STREAM_COLORS[index],
				headerColor: STREAM_HEADER_COLORS[index],
				backgroundColor: FIELD_BACKGROUND_COLORS[index],
				iconColor: DATA_TYPE_COLORS[index],
			},
		}))
		.reduce((acc, fieldEntry) => ({ ...acc, ...fieldEntry }), {});

	// Filter out fields related to the deleted stream from pageData
	const updatedPageData = store.tableOpts.pageData.map((row) => {
		// Remove keys that belong to the deleted stream
		const filteredRow = Object.keys(row)
			.filter((key) => !key.startsWith(`${currentStream}.`))
			.reduce((acc, key) => {
				acc[key] = row[key];
				return acc;
			}, {} as Record<string, string | number | Date | null>);
		return filteredRow;
	});

	return {
		...store,
		fields: updatedFields,
		streamData: newStreamData,
		selectedFields: newSelectedFields,
		tableOpts: {
			...store.tableOpts,
			pageData: updatedPageData,
		},
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
	setCorrelationCondition,
	parseQuery,
	setIsCorrelatedFlag,
	setCorrelationId,
	setCorrelations,
	toggleSavedCorrelationsModal,
	toggleSaveCorrelationModal,
	setActiveCorrelation,
	cleanCorrelationStore,
	setSavedCorrelationId,
};

export { CorrelationProvider, useCorrelationStore, correlationStoreReducers };
