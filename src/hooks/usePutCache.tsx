import useMountedState from './useMountedState';
import { StatusCodes } from 'http-status-codes';
import { updateCaching } from '@/api/caching';

export const usePutCache = () => {
	const [data, setData] = useMountedState<boolean | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const updateCache = async (streamName: string, type: boolean) => {
		setLoading(true);
		try {
			const res = await updateCaching(streamName, type);

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					break;
				}
				default: {
					setError('Failed to change cache setting');
					console.error(res);
				}
			}
		} catch (error) {
			setError('Failed to change cache setting');
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, updateCache, resetData };
};
