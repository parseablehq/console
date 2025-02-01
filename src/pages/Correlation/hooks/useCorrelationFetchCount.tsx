import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import {
	CORRELATION_LOAD_LIMIT,
	correlationStoreReducers,
	useCorrelationStore,
} from '../providers/CorrelationProvider';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { getCorrelationQueryCount } from '@/api/query';
import _ from 'lodash';
import { useStreamStore } from '@/pages/Stream/providers/StreamProvider';

const { setTotalCount } = correlationStoreReducers;

export const useCorrelationFetchCount = () => {
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [{ fields, tableOpts, selectedFields, correlationCondition }, setCorrelationData] = useCorrelationStore(
		(store) => store,
	);
	const [streamInfo] = useStreamStore((store) => store.info);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const [countLoading, setCountLoading] = useState(true);

	const streamNames = Object.keys(fields);
	const defaultQueryOpts = {
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		limit: CORRELATION_LOAD_LIMIT,
		pageOffset: tableOpts.currentOffset,
		timePartitionColumn,
		selectedFields: _.flatMap(selectedFields, (values, key) => _.map(values, (value) => `${key}.${value}`)) || [],
		correlationCondition: correlationCondition,
	};
	const queryOpts = { ...defaultQueryOpts, streamNames };

	const { refetch: refetchCount } = useQuery(
		['fetchCount', defaultQueryOpts],
		async () => {
			setCountLoading(true);
			const data = await getCorrelationQueryCount(queryOpts);
			const count = _.first(data.data)?.count;
			typeof count === 'number' && setCorrelationData((store) => setTotalCount(store, count));
			return data;
		},
		{
			// query for count should always hit the endpoint for parseable query
			refetchOnWindowFocus: false,
			retry: false,
			enabled: false,
			onSuccess: () => {
				setCountLoading(false);
			},
			onError: () => {
				setCountLoading(false);
			},
		},
	);

	return {
		countLoading,
		refetchCount,
	};
};
