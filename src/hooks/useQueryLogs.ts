import { SortOrder, type Log, type LogsData, type LogsSearch } from '@/@types/parseable/api/query';
import { getQueryLogs, getQueryResult } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useCallback, useEffect, useMemo, useRef, useTransition } from 'react';
import { LOG_TABLE_PER_PAGE, useLogsPageContext } from '@/pages/Logs/logsContextProvider';
import { parseLogData } from '@/utils';
import { useLogsStore, logsStoreReducers } from '@/pages/Logs/providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useQueryResult } from './useQueryResult';

const {setData, setTotalCount} = logsStoreReducers;

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
	const [pageLogData, setPageLogData] = useMountedState<LogsData | null>(null);
	const [querySearch, setQuerySearch] = useMountedState<LogsSearch>({
		search: '',
		filters: {},
		sort: {
			key: 'p_timestamp',
			order: SortOrder.DESCENDING,
		},
	});
	const [isPending, startTransition] = useTransition();
	const {
		state: { subLogQueryData, custQuerySearchState },
	} = useLogsPageContext();
	const [currentStream] = useAppStore(store => store.currentStream)
	const [{timeRange, tableOpts: {currentOffset}}, setLogsStore] = useLogsStore(store => store)
	const { isQuerySearchActive, custSearchQuery } = custQuerySearchState;

	const data: Log[] | null = useMemo(() => {
		if (_dataRef.current) {
			const logs = _dataRef.current;
			const temp: Log[] = [];
			const { search, filters, sort } = querySearch;
			const searchText = search.trim().toLowerCase();
			const filteredKeys = Object.keys(filters);

			mainLoop: for (const log of logs) {
				if (filteredKeys.length) {
					const isFiltered = filteredKeys.every((x) => {
						const logValue = log[x];
						return logValue && filters[x].includes(logValue.toString());
					});

					if (!isFiltered) {
						continue;
					}
				}

				if (searchText) {
					for (const key in log) {
						const logValue = parseLogData(log[key], key);
						if (logValue?.toString().toLowerCase().includes(searchText)) {
							temp.push(log);
							continue mainLoop;
						}
					}
				} else {
					temp.push(log);
				}
			}

			const { key, order } = sort;

			temp.sort(({ [key]: aData }, { [key]: bData }) => {
				let res = 0;
				if (aData === bData) res = 0;
				else if (aData === null) res = -1;
				else if (bData === null) res = 1;
				else res = aData > bData ? 1 : -1;

				return res * order;
			});

			subLogQueryData.set((state) => {
				state.filteredData = temp;
				state.rawData = logs;
			});

			// remove
			setLogsStore(store => setData(store, {rawData: logs, filteredData: temp}))
			return temp;
		}

		return null;
	}, [_dataRef.current, querySearch]);

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

	const goToPage = (page = 1, limit: number = LOG_TABLE_PER_PAGE[0]) => {
		const firstPageIndex = (page - 1) * limit;
		const lastPageIndex = firstPageIndex + limit;

		if (data) {
			const totalCount = data.length;
			const totalPages = Math.ceil(totalCount / limit);
			startTransition(() => {
				setPageLogData({
					data: data.slice(firstPageIndex, lastPageIndex),
					limit,
					page,
					totalCount,
					totalPages,
				});
			});
		}
	};

	const setPageLimit = (limit: number) => {
		goToPage(1, limit);
	};

	useEffect(() => {
		if (data) {
			goToPage();
		}
	}, [data]);

	// refactor
	const defaultQueryOpts = {
		streamName: currentStream || '',
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		limit: 9000,
		pageOffset: currentOffset
	}
	const getQueryData = async (logsQuery: QueryLogs = defaultQueryOpts) => {
		try {
			setLoading(true);
			setError(null);

			const logsQueryRes = isQuerySearchActive
				? await getQueryResult({ ...logsQuery, access: [] }, appendOffsetToQuery(custSearchQuery, logsQuery.pageOffset))
				: await getQueryLogs(logsQuery);

			const data = logsQueryRes.data;

			if (logsQueryRes.status === StatusCodes.OK) {
				_dataRef.current = data;
				return;
			}
			if (typeof data === 'string' && data.includes('Stream is not initialized yet')) {
				_dataRef.current = [];
				return;
			}
			setError('Failed to query log');
		} catch {
			setError('Failed to query log');
		} finally {
			setLoading(false);
		}
	};

	const { fetchQueryMutation } = useQueryResult();
	useEffect(() => {
		if (fetchQueryMutation?.data?.count) {
			setLogsStore((store) => setTotalCount(store, fetchQueryMutation.data.count));
		}
	}, [fetchQueryMutation.data]);

	const fetchCount = () => {
		try {
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
		data,
		pageLogData,
		setQuerySearch,
		getColumnFilters,
		sort: querySearch.sort,
		error,
		loading: loading || isPending,
		getQueryData,
		resetData,
		goToPage,
		setPageLimit,
		fetchCount
	};
};
