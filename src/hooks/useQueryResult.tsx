import { getQueryResult } from '@/api/query';
import { LogsQuery } from '@/@types/parseable/api/query';
import { notifications } from '@mantine/notifications';
import { isAxiosError, AxiosError } from 'axios';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { useMutation } from 'react-query';

type QueryData = {
	logsQuery: LogsQuery;
	query: string;
	onSuccess?: ()=>void;
};

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
		onSuccess: (_data,variables) => {
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
