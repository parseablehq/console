import { useMutation, useQuery } from 'react-query';
import { getLogStreamAlerts, putLogStreamAlerts } from '@/api/logStream';

export const useAlertsEditor = (streamName: string) => {
	const { mutate: updateLogStreamAlerts } = useMutation((data: any) => putLogStreamAlerts(streamName, data), {
		onSuccess: () => {},
		onError: () => {},
	});

	return {
		updateLogStreamAlerts,
	};
};

export const useGetAlerts = (streamName: string) => {
	const {
		data: getLogAlertData,
		isError: getLogAlertIsError,
		isSuccess: getLogAlertIsSuccess,
		isLoading: getLogAlertIsLoading,
	} = useQuery(['fetch-log-stream-alert', streamName], () => getLogStreamAlerts(streamName), {
		retry: false,
		enabled: streamName !== '',
		refetchOnWindowFocus: false,
	});

	return {
		getLogAlertData,
		getLogAlertIsError,
		getLogAlertIsSuccess,
		getLogAlertIsLoading,
	};
};
