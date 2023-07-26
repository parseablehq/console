import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { putLogStreamAlerts } from '@/api/logStream';

export const usePutLogStreamAlerts = () => {
	const [data, setData] = useMountedState<{
		data: any;
	} | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const putAlertsData = async (streamName :string, payload:any) => {
		try {
			setLoading(true);
			setError(null);

			const [logsAlertsRes] = await Promise.all([putLogStreamAlerts(streamName, payload)]);

			const data = logsAlertsRes.data;

			if (logsAlertsRes.status === StatusCodes.OK) {
				setData({ data });
				return;
			}

			setError(logsAlertsRes.data);
		} catch (error: any) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, putAlertsData, resetData };
};
