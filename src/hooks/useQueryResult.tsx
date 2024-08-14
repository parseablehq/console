import { getQueryResult } from '@/api/query';
import { LogsQuery } from '@/@types/parseable/api/query';
import { notifications } from '@mantine/notifications';
import { isAxiosError, AxiosError } from 'axios';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { useMutation, useQuery } from 'react-query';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import _ from 'lodash';

type QueryData = {
	logsQuery: LogsQuery;
	query: string;
	onSuccess?: () => void;
};

type FooterCountResponse = { [count: string]: number }[];

export const useQueryResult = () => {
	const fetchQueryHandler = async (data: QueryData) => {
		const response = await getQueryResult(data.logsQuery, data.query);
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

	const useFetchFooterCount = (queryData: QueryData | null) => {
		const { setTotalCount } = logsStoreReducers;
		const [, setLogsStore] = useLogsStore((store) => store);
		const {
			isLoading: footerCountLoading,
			isRefetching: footerCountRefetching,
			refetch: footerCountRefetch,
		} = useQuery(['fetchQuery'], () => fetchQueryHandler(queryData!), {
			onSuccess: (data: FooterCountResponse) => {
				const footerCount = _.first(data)?.count || 0;
				console.log(data);
				setLogsStore((store) => setTotalCount(store, footerCount));
			},
		});

		return {
			footerCountLoading,
			footerCountRefetch,
			footerCountRefetching,
		};
	};

	return { fetchQueryMutation, useFetchFooterCount };
};
