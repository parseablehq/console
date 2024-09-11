import { SortOrder, type Log, type LogsData, type LogsSearch } from '@/@types/parseable/api/query';
import { getQueryLogsWithHeaders, getQueryResultWithHeaders } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
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
	const hasOffset = query.toLowerCase().includes('offset');
	return hasOffset ? query.replace(/offset\s+\d+/i, `OFFSET ${offset}`) : `${query} OFFSET ${offset}`;
};

export const useQueryLogs = () => {
	// data ref will always have the unfiltered data.
	// Only mutate it when data is fetched, otherwise read only
	const _dataRef = useRef<Log[] | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
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
	const [
		{
			timeRange,
			tableOpts: { currentOffset, instantSearchValue },
			custQuerySearchState,
		},
		setLogsStore,
	] = useLogsStore((store) => store);
	const [appliedQuery] = useFilterStore((store) => store.appliedQuery);
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
	const getQueryData = async () => {
		try {
			setLoading(true);
			setError(null);
			refetchSchema(); // fetch schema parallelly every time we fetch logs
			const logsQueryRes = await (async () => {
				if (isQuerySearchActive) {
					if (activeMode === 'filters') {
						const { parsedQuery } = parseQuery(appliedQuery, currentStream || '', {
							startTime: timeRange.startTime,
							endTime: timeRange.endTime,
							timePartitionColumn,
						});
						const queryStrWithOffset = appendOffsetToQuery(parsedQuery, defaultQueryOpts.pageOffset);
						return await getQueryResultWithHeaders({ ...defaultQueryOpts, access: [] }, queryStrWithOffset);
					} else {
						const queryStrWithOffset = appendOffsetToQuery(custSearchQuery, defaultQueryOpts.pageOffset);
						return await getQueryResultWithHeaders({ ...defaultQueryOpts, access: [] }, queryStrWithOffset);
					}
				} else {
					return await getQueryLogsWithHeaders(defaultQueryOpts);
				}
			})();
			const logs = logsQueryRes.data;
			const isInvalidResponse = _.isEmpty(logs) || _.isNil(logs) || logsQueryRes.status !== StatusCodes.OK;
			if (isInvalidResponse) return setError('Failed to query log');

			const { records, fields } = logs;
			const jqFilteredData = isJqSearch(instantSearchValue) ? await jqSearch(records, instantSearchValue) : [];
			return setLogsStore((store) => setLogData(store, records, fields, jqFilteredData));
		} catch (e) {
			const axiosError = e as AxiosError;
			const errorMessage = axiosError?.response?.data;
			setError(_.isString(errorMessage) && !_.isEmpty(errorMessage) ? errorMessage : 'Failed to query log');
			return setLogsStore((store) => setLogData(store, [], []));
		} finally {
			setLoading(false);
		}
	};

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
		loading: loading,
		getQueryData,
		resetData,
	};
};
