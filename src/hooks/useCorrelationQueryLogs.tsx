import { getCorrelationQueryLogsWithHeaders } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { AxiosError } from 'axios';
import { useStreamStore } from '@/pages/Stream/providers/StreamProvider';
import {
	CORRELATION_LOAD_LIMIT,
	correlationStoreReducers,
	useCorrelationStore,
} from '@/pages/Correlation/providers/CorrelationProvider';
import { notifyError } from '@/utils/notification';
import { useQuery } from 'react-query';

const { setStreamData } = correlationStoreReducers;

export const useCorrelationQueryLogs = () => {
	const [error, setError] = useMountedState<string | null>(null);
	const [{ selectedFields, streamData, correlationCondition }, setCorrelationStore] = useCorrelationStore(
		(store) => store,
	);
	const [queryEngine] = useAppStore((store) => store.instanceConfig?.queryEngine);
	const [streamInfo] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [
		{
			tableOpts: { currentOffset },
		},
	] = useLogsStore((store) => store);

	const defaultQueryOpts = {
		queryEngine,
		streamNames: correlationCondition ? Object.keys(streamData) : [currentStream || ''],
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		limit: CORRELATION_LOAD_LIMIT,
		pageOffset: currentOffset,
		timePartitionColumn,
		selectedFields: _.flatMap(selectedFields, (values, key) => _.map(values, (value) => `${key}.${value}`)) || [],
		correlationCondition: correlationCondition,
	};

	const {
		isLoading: logsLoading,
		isRefetching: logsRefetching,
		refetch: getCorrelationData,
	} = useQuery(
		['fetch-logs', defaultQueryOpts],
		() => {
			return getCorrelationQueryLogsWithHeaders(defaultQueryOpts);
		},
		{
			enabled: false,
			refetchOnWindowFocus: false,
			onSuccess: async (data) => {
				const logs = data.data;
				const isInvalidResponse = _.isEmpty(logs) || _.isNil(logs) || data.status !== StatusCodes.OK;
				if (isInvalidResponse) return setError('Failed to query logs');

				const { records, fields } = logs;
				if (fields.length > 0 && !correlationCondition) {
					return setCorrelationStore((store) => setStreamData(store, currentStream || '', records));
				} else if (fields.length > 0 && correlationCondition) {
					return setCorrelationStore((store) => setStreamData(store, 'correlatedStream', records));
				} else {
					notifyError({ message: `${currentStream} doesn't have any fields` });
				}
			},
			onError: (data: AxiosError) => {
				const errorMessage = data.response?.data as string;
				setError(_.isString(errorMessage) && !_.isEmpty(errorMessage) ? errorMessage : 'Failed to query logs');
			},
		},
	);

	return {
		error,
		loading: logsLoading || logsRefetching,
		getCorrelationData,
	};
};
