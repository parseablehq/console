import { getQueryResult } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { LogsQuery } from '@/@types/parseable/api/query';

export const useQueryResult = () => {
	const [data, setData] = useMountedState<{
		data: any;
	} | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getQueryData = async (logsQuery: LogsQuery, query = '') => {
		try {
			setLoading(true);
			setError(null);

			const [logsQueryRes] = await Promise.all([getQueryResult(logsQuery, query)]);

			const data = logsQueryRes.data;

			if (logsQueryRes.status === StatusCodes.OK) {
				setData({ data });
				return;
			}

			if (typeof data === 'string' && data.includes('Stream is not initialized yet')) {
				setData({
					data: [],
				});
				return;
			}

			setError(logsQueryRes.data);
		} catch (error: any) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, getQueryData, resetData };
};
