import { SortOrder, type Log, type LogsData, type LogsSearch } from '@/@types/parseable/api/query';
import { getQueryLogsWithHeaders, getQueryResultWithHeaders } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useCallback, useEffect, useRef } from 'react';
import { useLogsStore, logsStoreReducers, LOAD_LIMIT, isJqSearch } from '@/pages/Stream/providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useQueryResult } from './useQueryResult';
import _ from 'lodash';
import { AxiosError } from 'axios';
import jqSearch from '@/utils/jqSearch';
import { useGetLogStreamSchema } from './useGetLogStreamSchema';

const { setLogData, setTotalCount } = logsStoreReducers;

type QueryLogs = {
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
	pageOffset: number;
};

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
	const [isFetchingCount, setIsFetchingCount] = useMountedState<boolean>(false);
	const [pageLogData, setPageLogData] = useMountedState<LogsData | null>(null);
	const { getDataSchema } = useGetLogStreamSchema();
	const [querySearch, setQuerySearch] = useMountedState<LogsSearch>({
		search: '',
		filters: {},
		sort: {
			key: 'p_timestamp',
			order: SortOrder.DESCENDING,
		},
	});
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [
		{
			timeRange,
			tableOpts: { currentOffset, instantSearchValue },
			custQuerySearchState,
		},
		setLogsStore,
	] = useLogsStore((store) => store);
	const { isQuerySearchActive, custSearchQuery } = custQuerySearchState;

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
	};
	const getQueryData = async (logsQuery: QueryLogs = defaultQueryOpts) => {
		try {
			setLoading(true);
			setError(null);
			getDataSchema(); // fetch schema parallelly every time we fetch logs
			const logsQueryRes = isQuerySearchActive
				? await getQueryResultWithHeaders(
						{ ...logsQuery, access: [] },
						appendOffsetToQuery(custSearchQuery, logsQuery.pageOffset),
				  )
				: await getQueryLogsWithHeaders(logsQuery);

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

	// fetchQueryMutation is used only on fetching count
	// refactor this hook if you want to use mutation anywhere else
	const { fetchQueryMutation } = useQueryResult();

	useEffect(() => {
		const { fields = [], records = [] } = fetchQueryMutation.data || {};
		const firstRecord = _.first(records);
		if (_.includes(fields, 'count') && _.includes(_.keys(firstRecord), 'count')) {
			const count = _.get(firstRecord, 'count', 0);
			setLogsStore((store) => setTotalCount(store, _.toInteger(count)));
		}
	}, [fetchQueryMutation.data]);

	const fetchCount = () => {
		try {
			setIsFetchingCount(true);
			const defaultQuery = `select count(*) as count from ${currentStream}`;
			const query = isQuerySearchActive
				? custSearchQuery.replace(/SELECT[\s\S]*?FROM/i, 'SELECT COUNT(*) as count FROM')
				: defaultQuery;
			if (currentStream && query?.length > 0) {
				const logsQuery = {
					streamName: currentStream,
					startTime: timeRange.startTime,
					endTime: timeRange.endTime,
					access: [],
				};
				fetchQueryMutation.mutate({
					logsQuery,
					query,
					onSuccess: () => setIsFetchingCount(false),
				});
			}
		} catch (e) {
			console.log(e);
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
		fetchCount,
		isFetchingCount,
	};
};
