import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { putLogStreamRetention } from '@/api/logStream';

export const usePutLogStreamRetention = () => {
	const [data, setData] = useMountedState<{
		data: any;
	} | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const putRetentionData = async (streamName :string, payload:any) => {
		try {
			setLoading(true);
			setError(null);

			const [logRetentionRes] = await Promise.all([putLogStreamRetention(streamName, payload)]);

			const data = logRetentionRes.data;

			if (logRetentionRes.status === StatusCodes.OK) {
				setData({ data });
				return;
			}

			setError(logRetentionRes.data);
		} catch (error: any) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, putRetentionData, resetData };
};