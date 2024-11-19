import { getQueryLogsWithHeaders } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { AxiosError } from 'axios';
import { useGetStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useStreamStore } from '@/pages/Stream/providers/StreamProvider';
import {
	CORRELATION_LOAD_LIMIT,
	correlationStoreReducers,
	useCorrelationStore,
} from '@/pages/Correlation/providers/CorrelationProvider';
import { notifyError } from '@/utils/notification';

const { setStreamData } = correlationStoreReducers;

export const useCorrelationQueryLogs = () => {
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
	const [, setCorrelationStore] = useCorrelationStore((store) => store.streamData);
	const [queryEngine] = useAppStore((store) => store.instanceConfig?.queryEngine);
	const [streamInfo] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const { refetch: refetchSchema } = useGetStreamSchema({ streamName: currentStream || '' });
	const [
		{
			timeRange,
			tableOpts: { currentOffset },
		},
	] = useLogsStore((store) => store);

	const defaultQueryOpts = {
		queryEngine,
		streamName: currentStream || '',
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		limit: CORRELATION_LOAD_LIMIT,
		pageOffset: currentOffset,
		timePartitionColumn,
	};

	const getCorrelationData = async () => {
		try {
			setLoading(true);
			setError(null);
			refetchSchema(); // fetch schema parallelly every time we fetch logs
			const logsQueryRes = await (async () => {
				return await getQueryLogsWithHeaders(defaultQueryOpts);
			})();
			const logs = logsQueryRes.data;
			const isInvalidResponse = _.isEmpty(logs) || _.isNil(logs) || logsQueryRes.status !== StatusCodes.OK;
			if (isInvalidResponse) return setError('Failed to query log');

			const { records, fields } = logs;
			if (fields.length > 0) {
				return setCorrelationStore((store) => setStreamData(store, currentStream || '', records, fields));
			} else {
				notifyError({ message: `${currentStream} doesn't have any fields` });
			}
		} catch (e) {
			const axiosError = e as AxiosError;
			const errorMessage = axiosError?.response?.data;
			setError(_.isString(errorMessage) && !_.isEmpty(errorMessage) ? errorMessage : 'Failed to query log');
			return setCorrelationStore((store) => setStreamData(store, currentStream || '', [], []));
		} finally {
			setLoading(false);
		}
	};

	return {
		error,
		loading: loading,
		getCorrelationData,
	};
};
