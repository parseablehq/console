import {
	CORRELATION_LOAD_LIMIT,
	correlationStoreReducers,
	useCorrelationStore,
} from '@/pages/Correlation/providers/CorrelationProvider';

import { AxiosError } from 'axios';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import _ from 'lodash';
import { getCorrelationQueryLogsWithHeaders } from '@/api/query';
import { notifyError } from '@/utils/notification';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import useMountedState from './useMountedState';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { useStreamStore } from '@/pages/Stream/providers/StreamProvider';

const { setStreamData, setIsCorrelatedFlag } = correlationStoreReducers;

export const useCorrelationQueryLogs = () => {
	const [error, setError] = useMountedState<string | null>(null);
	const [{ selectedFields, correlationCondition, fields }, setCorrelationStore] = useCorrelationStore((store) => store);
	const [streamInfo] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [loadingState, setLoading] = useState<boolean>(true);
	const [
		{
			tableOpts: { currentOffset },
		},
	] = useCorrelationStore((store) => store);
	const streamNames = Object.keys(fields);

	const defaultQueryOpts = {
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		limit: CORRELATION_LOAD_LIMIT,
		pageOffset: currentOffset,
		timePartitionColumn,
		selectedFields: _.flatMap(selectedFields, (values, key) => _.map(values, (value) => `${key}.${value}`)) || [],
		correlationCondition: correlationCondition,
	};

	const { refetch: getCorrelationData } = useQuery(
		['fetch-logs', defaultQueryOpts],
		async () => {
			setLoading(true);
			const queryOpts = { ...defaultQueryOpts, streamNames };
			const response = await getCorrelationQueryLogsWithHeaders(queryOpts);
			return [response];
		},
		{
			enabled: false,
			refetchOnWindowFocus: false,
			onSuccess: async (responses) => {
				setLoading(false);
				responses.map((data: { data: LogsResponseWithHeaders }) => {
					const logs = data.data;
					const isInvalidResponse = _.isEmpty(logs) || _.isNil(logs);
					if (isInvalidResponse) return setError('Failed to query logs');

					const { records, fields } = logs;
					if (fields.length > 0 && !correlationCondition) {
						return setCorrelationStore((store) => setStreamData(store, currentStream || '', records));
					} else if (fields.length > 0 && correlationCondition) {
						setCorrelationStore((store) => setIsCorrelatedFlag(store, true));
						return setCorrelationStore((store) => setStreamData(store, 'correlatedStream', records));
					} else {
						notifyError({ message: `${currentStream} doesn't have any fields` });
					}
				});
			},
			onError: (data: AxiosError) => {
				setLoading(false);
				const errorMessage = data.response?.data as string;
				setError(_.isString(errorMessage) && !_.isEmpty(errorMessage) ? errorMessage : 'Failed to query logs');
			},
		},
	);

	return {
		error,
		loadingState,
		getCorrelationData,
	};
};
