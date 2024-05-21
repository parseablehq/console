import { useMutation, useQuery } from 'react-query';
import { getLogStreamAlerts, putLogStreamAlerts } from '@/api/logStream';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import { useStreamStore, streamStoreReducers, AlertsResponse, Alert } from '@/pages/Stream/providers/StreamProvider';

const { setAlertsConfig } = streamStoreReducers;
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
	const [, setStreamStore] = useStreamStore((store) => null);
	const { data, isError, isSuccess, isLoading, refetch } = useQuery(
		['fetch-log-stream-alert', streamName],
		() => getLogStreamAlerts(streamName),
		{
			retry: false,
			enabled: streamName !== '',
			refetchOnWindowFocus: false,
			onSuccess: (data) => {
				setStreamStore((store) => setAlertsConfig(store, data));
			},
		},
	);

	return {
		data,
		isError,
		isSuccess,
		isLoading,
		refetch,
	};
};
