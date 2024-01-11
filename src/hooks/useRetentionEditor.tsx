import { useMutation, useQuery } from 'react-query';
import { getLogStreamRetention, putLogStreamRetention } from '@/api/logStream';
import { notifyApi } from '@/utils/notification';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import useMountedState from './useMountedState';
import { isAxiosError, AxiosError } from 'axios';

export const useRetentionEditor = (streamName: string) => {
	const [retentionQuery, setRetentionQuery] = useMountedState<string | undefined>('');

	const {
		mutate: updateLogStreamRetention,
		data: retentionEditorData,
		isSuccess: updateLogRetentionIsSuccess,
	} = useMutation((data: string) => putLogStreamRetention(streamName, data), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				message: 'Retention Added.',
				icon: <IconCheck size="1rem" />,
			});
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
	});

	const {
		data: getLogRetentionData,
		isError: getLogRetentionIsError,
		isLoading: getLogRetentionIsLoading,
		isSuccess: getLogRetentionIsSuccess,
	} = useQuery(
		['fetch-log-stream-retention', streamName, updateLogRetentionIsSuccess],
		() => getLogStreamRetention(streamName),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to get log streams retention',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			onSuccess: (data) => {
				setRetentionQuery(JSON.stringify(data?.data));
			},
			retry: false,
			enabled: streamName !== '',
		},
	);

	const handleRetentionQueryChange = (value: string | undefined) => setRetentionQuery(value);

	const submitRetentionQuery = () => {
		try {
			if (retentionQuery) {
				JSON.parse(retentionQuery);
				updateLogStreamRetention(retentionQuery);
			} else {
				throw new Error('Invalid JSON');
			}
		} catch (e) {
			notifications.show({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${e}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
		}
	};

	return {
		retentionQuery,
		handleRetentionQueryChange,
		submitRetentionQuery,
		retentionEditorData,
		getLogRetentionData,
		getLogRetentionIsLoading,
		getLogRetentionIsError,
		getLogRetentionIsSuccess,
	};
};
