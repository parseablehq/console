import useMountedState from './useMountedState';
import { StatusCodes } from 'http-status-codes';
import { getCachingStatus } from '@/api/caching';

export const useGetCacheStatus = () => {
	const [data, setData] = useMountedState<boolean | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getCacheStatus = async (streamName: string) => {
		setLoading(true);
		try {
			const res = await getCachingStatus(streamName);

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					break;
				}
				default: {
					setError('Failed to get cache status');
					console.error(res);
				}
			}
		} catch (error) {
			setError('Failed to get cache status');
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, getCacheStatus, resetData };
};
