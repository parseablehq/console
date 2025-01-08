import { SortOrder, type Log, type LogsData, type LogsSearch } from '@/@types/parseable/api/query';
import { getQueryLogsWithHeaders, getQueryResultWithHeaders } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useQuery } from 'react-query';
import { useCallback, useRef } from 'react';
import { useLogsStore, logsStoreReducers, LOAD_LIMIT, isJqSearch } from '@/pages/Stream/providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { AxiosError } from 'axios';
import jqSearch from '@/utils/jqSearch';
import { useGetStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useStreamStore } from '@/pages/Stream/providers/StreamProvider';
import { useFilterStore, filterStoreReducers } from '@/pages/Stream/providers/FilterProvider';

const { setLogData } = logsStoreReducers;
const { parseQuery } = filterStoreReducers;

const appendOffsetToQuery = (query: string, offset: number) => {
	const offsetRegex = /offset\s+\d+/i;
	const limitRegex = /limit\s+\d+/i;

	if (offsetRegex.test(query)) {
		// Replace the existing OFFSET with the new one
		return query.replace(offsetRegex, `OFFSET ${offset}`);
	} else {
		// Insert OFFSET before LIMIT if OFFSET is not present
		return query.replace(limitRegex, `OFFSET ${offset} $&`);
	}
};

export const useQueryLogs = () => {
	// data ref will always have the unfiltered data.
	// Only mutate it when data is fetched, otherwise read only
	const _dataRef = useRef<Log[] | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [pageLogData, setPageLogData] = useMountedState<LogsData | null>(null);
	const [querySearch, setQuerySearch] = useMountedState<LogsSearch>({
		search: '',
		filters: {},
		sort: {
			key: 'p_timestamp',
			order: SortOrder.DESCENDING,
		},
	});
	const [streamInfo] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const { refetch: refetchSchema } = useGetStreamSchema({ streamName: currentStream || '' });
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [
		{
			tableOpts: { currentOffset, instantSearchValue },
			custQuerySearchState,
		},
		setLogsStore,
	] = useLogsStore((store) => store);
	const [appliedQuery] = useFilterStore((store) => store.appliedQuery);
	const [isQueryFromParams] = useFilterStore((store) => store.isQueryFromParams);
	const { isQuerySearchActive, custSearchQuery, activeMode } = custQuerySearchState;

	const getColumnFilters = useCallback(
		(columnName: string) => {
			const logs = _dataRef.current;

			if (logs) {
				const temp = [];
				for (let i = 0; i < logs.length; i++) {
					const columnValue = logs[i][columnName];
					if (columnValue) {
						temp.push(columnValue);
					}
				}
				return [...new Set(temp)];
			}

			return null;
		},
		[_dataRef.current],
	);

	// refactor
	const defaultQueryOpts = {
		streamName: currentStream || '',
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		limit: LOAD_LIMIT,
		pageOffset: currentOffset,
		timePartitionColumn,
	};

	const {
		isLoading: logsLoading,
		isRefetching: logsRefetching,
		refetch: getQueryData,
	} = useQuery(
		['fetch-logs', defaultQueryOpts],
		() => {
			refetchSchema();
			if (isQuerySearchActive) {
				if (activeMode === 'filters' && isQueryFromParams === false) {
					const { parsedQuery } = parseQuery(appliedQuery, currentStream || '', {
						startTime: timeRange.startTime,
						endTime: timeRange.endTime,
						timePartitionColumn,
					});
					const queryStrWithOffset = appendOffsetToQuery(parsedQuery, defaultQueryOpts.pageOffset);
					return getQueryResultWithHeaders({ ...defaultQueryOpts, access: [] }, queryStrWithOffset);
				} else if (activeMode === 'filters' && isQueryFromParams === true) {
					const queryStrWithOffset = appendOffsetToQuery(custSearchQuery, defaultQueryOpts.pageOffset);
					return getQueryResultWithHeaders({ ...defaultQueryOpts, access: [] }, queryStrWithOffset);
				} else {
					const queryStrWithOffset = appendOffsetToQuery(custSearchQuery, defaultQueryOpts.pageOffset);
					return getQueryResultWithHeaders({ ...defaultQueryOpts, access: [] }, queryStrWithOffset);
				}
			} else {
				return getQueryLogsWithHeaders(defaultQueryOpts);
			}
		},
		{
			enabled: false,
			refetchOnWindowFocus: false,
			onSuccess: async (data) => {
				const logs = data.data;
				const isInvalidResponse = _.isEmpty(logs) || _.isNil(logs) || data.status !== StatusCodes.OK;
				if (isInvalidResponse) return setError('Failed to query logs');

				const { records, fields } = logs;
				const jqFilteredData = isJqSearch(instantSearchValue) ? await jqSearch(records, instantSearchValue) : [];
				setLogsStore((store) => setLogData(store, records, fields, jqFilteredData));
			},
			onError: (data: AxiosError) => {
				const errorMessage = data.response?.data as string;
				setError(_.isString(errorMessage) && !_.isEmpty(errorMessage) ? errorMessage : 'Failed to query logs');
			},
		},
	);

	const resetData = () => {
		_dataRef.current = null;
		setPageLogData(null);
		setError(null);
	};

	return {
		pageLogData,
		setQuerySearch,
		getColumnFilters,
		sort: querySearch.sort,
		error,
		loading: logsLoading || logsRefetching,
		getQueryData,
		resetData,
	};
};
