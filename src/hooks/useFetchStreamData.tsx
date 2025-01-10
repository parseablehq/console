import { getStreamDataWithHeaders } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { AxiosError } from 'axios';
import { useStreamStore } from '@/pages/Stream/providers/StreamProvider';
import {
	correlationStoreReducers,
	STREAM_DATA_LOAD_LIMIT,
	useCorrelationStore,
} from '@/pages/Correlation/providers/CorrelationProvider';
import { notifyError } from '@/utils/notification';
import { useQuery } from 'react-query';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import { useRef, useEffect } from 'react';

const { setStreamData } = correlationStoreReducers;

export const useFetchStreamData = () => {
	const [error, setError] = useMountedState<string | null>(null);
	const [{ selectedFields, correlationCondition, fields, streamData }, setCorrelationStore] = useCorrelationStore(
		(store) => store,
	);
	const [streamInfo] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [
		{
			tableOpts: { currentOffset },
		},
	] = useCorrelationStore((store) => store);
	const streamNames = Object.keys(fields);

	const prevTimeRangeRef = useRef({ startTime: timeRange.startTime, endTime: timeRange.endTime });

	const hasTimeRangeChanged =
		prevTimeRangeRef.current.startTime !== timeRange.startTime ||
		prevTimeRangeRef.current.endTime !== timeRange.endTime;

	useEffect(() => {
		prevTimeRangeRef.current = { startTime: timeRange.startTime, endTime: timeRange.endTime };
	}, [timeRange.startTime, timeRange.endTime]);

	const defaultQueryOpts = {
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		limit: STREAM_DATA_LOAD_LIMIT,
		pageOffset: currentOffset,
		timePartitionColumn,
		selectedFields: _.flatMap(selectedFields, (values, key) => _.map(values, (value) => `${key}.${value}`)) || [],
		correlationCondition: correlationCondition,
	};

	const {
		isLoading: logsLoading,
		isRefetching: logsRefetching,
		refetch: getFetchStreamData,
	} = useQuery(
		['fetch-logs', defaultQueryOpts],
		async () => {
			const streamsToFetch = hasTimeRangeChanged
				? streamNames
				: streamNames.filter((streamName) => !Object.keys(streamData).includes(streamName));

			const fetchPromises = streamsToFetch.map((streamName) => {
				const queryOpts = { ...defaultQueryOpts, streamNames: [streamName] };
				return getStreamDataWithHeaders(queryOpts);
			});
			return Promise.all(fetchPromises);
		},
		{
			enabled: false,
			refetchOnWindowFocus: false,
			onSuccess: async (responses) => {
				responses.map((data: { data: LogsResponseWithHeaders; status: StatusCodes }) => {
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
				});
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
		getFetchStreamData,
	};
};
