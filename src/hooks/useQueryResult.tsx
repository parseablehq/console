import { getQueryResultWithHeaders } from '@/api/query';
import { LogsQuery } from '@/@types/parseable/api/query';
import { notifications } from '@mantine/notifications';
import { isAxiosError, AxiosError } from 'axios';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCallback } from 'react';

type QueryData = {
	logsQuery: LogsQuery;
	query: string;
	onSuccess?: () => void;
};

type FooterCountResponse = {
	fields: string[];
	records: {
		count: number;
	}[];
};

export const useQueryResult = () => {
	const fetchQueryHandler = async (data: QueryData) => {
		const response = await getQueryResultWithHeaders(data.logsQuery, data.query);
		if (response.status !== 200) {
			throw new Error(response.statusText);
		}
		return response.data;
	};

	const fetchQueryMutation = useMutation(fetchQueryHandler, {
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				notifications.update({
					id: 'load-data',
					color: 'red',
					title: 'Error occurred',
					message: 'Error occurred, please check your query and try again',
					icon: <IconFileAlert size="1rem" />,
					autoClose: 2000,
				});
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

	const invalidateFooterQuery = useCallback(() => {
		const queryClient = useQueryClient();
		queryClient.invalidateQueries({ queryKey: ['fetchFooterCount'] });
	}, [useQueryClient]);

	const useFetchFooterCount = () => {
		const [currentStream] = useAppStore((store) => store.currentStream);
		const { setTotalCount } = logsStoreReducers;
		const [{ timeRange, custQuerySearchState }, setLogsStore] = useLogsStore((store) => store);
		const { isQuerySearchActive, custSearchQuery } = custQuerySearchState;

		const defaultQuery = `select count(*) as count from ${currentStream}`;
		const query = isQuerySearchActive
			? custSearchQuery.replace(/SELECT[\s\S]*?FROM/i, 'SELECT COUNT(*) as count FROM')
			: defaultQuery;

		const logsQuery = {
			streamName: currentStream || '',
			startTime: timeRange.startTime,
			endTime: timeRange.endTime,
			access: [],
		};
		const {
			isLoading: footerCountLoading,
			isRefetching: footerCountRefetching,
			refetch: footerCountRefetch,
		} = useQuery(['fetchFooterCount', logsQuery], () => fetchQueryHandler({ logsQuery, query }), {
			onSuccess: (data: FooterCountResponse) => {
				const footerCount = _.first(data.records)?.count;
				footerCount && setLogsStore((store) => setTotalCount(store, footerCount));
			},
			cacheTime: 30 * 1000,
			refetchOnWindowFocus: false,
			retry: false,
			enabled: currentStream !== null,
		});

		return {
			footerCountLoading,
			footerCountRefetch,
			footerCountRefetching,
		};
	};

	return { fetchQueryMutation, useFetchFooterCount, invalidateFooterQuery };
};
