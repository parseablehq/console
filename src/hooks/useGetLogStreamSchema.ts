import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { getLogStreamSchema } from '@/api/logStream';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';

export const useGetLogStreamSchema = () => {
	const [data, setData] = useMountedState<LogStreamSchemaData | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getDataSchema = async (streamName: string) => {
		try {
			setLoading(true);
			setError(null);
			const res = await getLogStreamSchema(streamName);

			switch (res.status) {
				case StatusCodes.OK: {
					const streams = res.data;

					setData(streams);
					break;
				}
				default: {
					setError('Failed to get log schema');
				}
			}
		} catch {
			setError('Failed to get log schema');
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, getDataSchema, resetData };
};
