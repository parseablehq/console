import { useMutation, useQuery } from 'react-query';
import { getLogStreamAlerts, putLogStreamAlerts } from '@/api/logStream';
import { IconFileAlert } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import useMountedState from './useMountedState';
import { Dayjs } from 'dayjs';

export const useAlertsEditor = (streamName: string, fetchStartTime?: Dayjs) => {
	const [alertQuery, setAlertQuery] = useMountedState<string | undefined>('');

	const {
		mutate: updateLogStreamAlerts,
		data: alertQueryData,
		isSuccess: updateLogStreamIsSuccess,
	} = useMutation((data: string) => putLogStreamAlerts(streamName, data), {});

	const {
		data: getLogAlertData,
		isError: getLogAlertIsError,
		isSuccess: getLogAlertIsSuccess,
		isLoading: getLogAlertIsLoading,
	} = useQuery(['fetch-log-stream-alert', streamName, updateLogStreamIsSuccess, fetchStartTime], () => getLogStreamAlerts(streamName), {
		onSuccess: (data) => {
			setAlertQuery(JSON.stringify(data?.data));
		},
		retry: false,
		enabled: streamName !== '',
	});

	const handleAlertQueryChange = (value: string | undefined) => setAlertQuery(value);

	const submitAlertQuery = () => {
		try {
			if (alertQuery) {
				JSON.parse(alertQuery);
				updateLogStreamAlerts(alertQuery);
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
		alertQuery,
		handleAlertQueryChange,
		submitAlertQuery,
		alertQueryData,
		getLogAlertData,
		getLogAlertIsError,
		getLogAlertIsSuccess,
		getLogAlertIsLoading,
	};
};
