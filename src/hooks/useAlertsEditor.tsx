import { useMutation, useQuery } from 'react-query';
import { getLogStreamAlerts, putLogStreamAlerts } from '@/api/logStream';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';

export const useAlertsEditor = (streamName: string) => {
	const { mutate: updateLogStreamAlerts } = useMutation(
		(data: { config: any; onSuccess?: () => void }) => putLogStreamAlerts(streamName, data.config),
		{
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
				notifySuccess({ message: 'Updated Successfully' });
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response?.data as string;
					typeof error === 'string' && notifyError({ message: error });
				} else if (data.message && typeof data.message === 'string') {
					notifyError({ message: data.message });
				}
			},
		},
	);

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
		refetch: getLogAlertDataRefetch
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
		getLogAlertDataRefetch
	};
};
