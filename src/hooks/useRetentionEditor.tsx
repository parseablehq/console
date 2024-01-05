import { useMutation, useQuery } from 'react-query';
import { getLogStreamRetention, putLogStreamRetention } from '@/api/logStream';
import { notifyApi } from '@/utils/notification';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import useMountedState from './useMountedState';

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
		onError: () => {
			notifyApi(
				{
					color: 'red',
					title: 'Error occurred',
					message: `Error occurred, please check your query and try again`,
					icon: <IconFileAlert size="1rem" />,
					autoClose: 3000,
				},
				true,
			);
		},
	});

	const { data: getLogRetentionData } = useQuery(
		['fetch-log-stream-retention', streamName, updateLogRetentionIsSuccess],
		() => getLogStreamRetention(streamName),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to log streams alert',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			retry: false,
			enabled: streamName !== '',
		},
	);

	const handleRetentionQueryChange = (value: string | undefined) => setRetentionQuery(value);

	const submitRetentionQuery = () => {
		try {
			JSON.parse(retentionQuery!);
			updateLogStreamRetention(retentionQuery!);
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
	};
};
