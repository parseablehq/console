import { LogsData } from '@/@types/parseable/api/stream';
import { getQueryLogs, getQueryLogsTotalCount } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { LogsQuery } from '@/@types/parseable/api/query';

export const useQueryLogs = () => {
	const [data, setData] = useMountedState<{
		totalCount: number;
		totalPages: number;
		data: LogsData;
		page: number;
	} | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(true);

	const getQueryData = async (logsQuery: LogsQuery, where = '') => {
		const { limit = 30, page = 1 } = logsQuery;

		try {
			setLoading(true);
			setError(null);

			const [logsQueryRes, logsQueryTotalCountRes] = await Promise.all([
				getQueryLogs(logsQuery, where),
				getQueryLogsTotalCount(logsQuery, where),
			]);

			const data = logsQueryRes.data;
			const totalCountData = logsQueryTotalCountRes.data;

			if (logsQueryRes.status === StatusCodes.OK && logsQueryTotalCountRes.status === StatusCodes.OK) {
				const totalCount = totalCountData[0]?.totalCount ?? 0;
				const totalPages = Math.ceil(totalCount / limit);

				setData({
					data,
					totalCount,
					totalPages,
					page,
				});
				return;
			}

			if (
				(typeof data === 'string' && data.includes('Stream is not initialized yet')) ||
				(typeof totalCountData === 'string' && totalCountData.includes('create_physical_expr'))
			) {
				setData({
					data: [],
					totalCount: 0,
					totalPages: 0,
					page,
				});
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
		setData(null);
	};

	return { data, error, loading, getQueryData, resetData };
};
