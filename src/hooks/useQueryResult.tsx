import { getQueryResultWithHeaders, getQueryResult } from '@/api/query';
import { LogsQuery } from '@/@types/parseable/api/query';
import { notifications } from '@mantine/notifications';
import { isAxiosError, AxiosError } from 'axios';
import { IconCheck } from '@tabler/icons-react';
import { useMutation, useQuery } from 'react-query';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { notifyError } from '@/utils/notification';

type QueryData = {
	logsQuery: LogsQuery;
	query: string;
	onSuccess?: () => void;
	useTrino?: boolean;
};

export const useQueryResult = () => {
	const fetchQueryHandler = async (data: QueryData) => {
		const response = await getQueryResultWithHeaders(data.logsQuery, data.query, data.useTrino);
		if (response.status !== 200) {
			throw new Error(response.statusText);
		}
		return response.data;
	};

	const fetchQueryMutation = useMutation(fetchQueryHandler, {
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response?.data as string;
				typeof error === 'string' && notifyError({ message: error });
			} else if (data.message && typeof data.message === 'string') {
				notifyError({ message: data.message });
			}
		},
		onSuccess: (_data, variables) => {
			variables.onSuccess && variables.onSuccess();
			notifications.update({
				id: 'load-data',
				color: 'green',
				title: 'Data was loaded',
				message: 'Successfully Loaded',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
		},
	});

	return { fetchQueryMutation };
};

export const useFetchCount = () => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const { setTotalCount } = logsStoreReducers;
	const [custQuerySearchState] = useLogsStore((store) => store.custQuerySearchState);
	const [timeRange, setLogsStore] = useLogsStore((store) => store.timeRange);
	const { isQuerySearchActive, custSearchQuery, activeMode } = custQuerySearchState;

	const defaultQuery = `select count(*) as count from \"${currentStream}\"`;
	const query = (() => {
		if (isQuerySearchActive) {
			const finalQuery = custSearchQuery.replace(/SELECT[\s\S]*?FROM/i, 'SELECT COUNT(*) as count FROM');
			if (activeMode === 'filters') {
				return finalQuery;
			} else {
				return finalQuery.replace(/ORDER\s+BY\s+[\w\s,.]+(?:ASC|DESC)?\s*(LIMIT\s+\d+)?\s*;?/i, '');
			}
		} else {
			return defaultQuery;
		}
	})();
	const logsQuery = {
		streamName: currentStream || '',
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
		access: [],
	};
	const {
		isLoading: isCountLoading,
		isRefetching: isCountRefetching,
		refetch: refetchCount,
	} = useQuery(['fetchCount', logsQuery], () => getQueryResult(logsQuery, query, false), {
		onSuccess: (resp) => {
			const count = _.first(resp.data)?.count;
			typeof count === 'number' && setLogsStore((store) => setTotalCount(store, count));
		},
		refetchOnWindowFocus: false,
		retry: false,
		enabled: currentStream !== null,
	});

	return {
		isCountLoading,
		isCountRefetching,
		refetchCount,
	};
};
