import { useMutation, useQueryClient } from 'react-query';
import { getQueryResult } from '@/api/query';
import { LogsQuery } from '@/@types/parseable/api/query';
import { notifications } from '@mantine/notifications';
import { notifyApi } from '@/utils/notification';
import { isAxiosError, AxiosError } from 'axios';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

type QueryData = {
	logsQuery: LogsQuery;
	query: string;
};

export const useQueryResult = () => {
	const queryClient = useQueryClient();

	const fetchQueryHandler = async (data: QueryData) => {
		const response = await getQueryResult(data.logsQuery, data.query);
		if (response.status !== 200) {
			throw new Error(response.statusText);
		}
		return response.data;
	};

	const fetchQueryMutation = useMutation(fetchQueryHandler, {
		onMutate: async (data) => {
			await queryClient.cancelQueries('myMutationKey');
			return data;
		},
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response.data;
				notifyApi(
					{
						color: 'red',
						title: 'Error occurred',
						message: `Error occurred, please check your query and try again ${error}`,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 3000,
					},
					true,
				);
			}
		},
		onSuccess: () => {
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
