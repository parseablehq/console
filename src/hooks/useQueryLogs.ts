import type { Log, LogsData, LogsQuery, LogsSearch } from '@/@types/parseable/api/query';
import { getQueryLogs } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useCallback, useEffect, useMemo, useRef, useTransition } from 'react';
import { LOG_QUERY_LIMITS } from '@/pages/Logs/Context';
import { parseLogData } from '@/utils';

export const useQueryLogs = () => {
	// data ref will always have the unfiltered data.
	// Only mutate it when data is fetched, otherwise read only

	const _dataRef = useRef<Log[] | null>(null);

	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(true);
	const [pageLogData, setPageLogData] = useMountedState<LogsData | null>(null);
	const [querySearch, setQuerySearch] = useMountedState<LogsSearch>({ search: '', filters: {} });
	const [isPending, startTransition] = useTransition();

	const data: Log[] | null = useMemo(() => {
		if (_dataRef.current) {
			const logs = _dataRef.current;
			const temp = [];
			const { search, filters } = querySearch;
			const searchText = search.trim().toLowerCase();
			const filteredKeys = Object.keys(filters);

			mainLoop: for (const log of logs) {
				if (filteredKeys.length) {
					const isFiltered = filteredKeys.every((x) => {
						const logValue = log[x];
						return logValue && filters[x].includes(logValue.toString());
					});

					if (!isFiltered) {
						continue mainLoop;
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

	const goToPage = (page = 1, limit: number = LOG_QUERY_LIMITS[0]) => {
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

	const getQueryData = async (logsQuery: LogsQuery) => {
		try {
			setLoading(true);
			setError(null);

			const logsQueryRes = await getQueryLogs(logsQuery);

			const data = logsQueryRes.data;

			if (logsQueryRes.status === StatusCodes.OK) {
				_dataRef.current = data;

				return;
			}

			setError('Failed to query log');
		} catch {
			setError('Failed to query log');
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		_dataRef.current = null;
		setPageLogData(null);
	};

	return {
		data,
		pageLogData,
		setQuerySearch,
		getColumnFilters,
		error,
		loading: loading || isPending,
		getQueryData,
		resetData,
		goToPage,
		setPageLimit,
	};
};
