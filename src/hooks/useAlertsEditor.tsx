import { useMutation, useQuery } from 'react-query';
import { getLogStreamAlerts, putLogStreamAlerts } from '@/api/logStream';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';
const { setAlertsConfig } = streamStoreReducers;

const useAlertsQuery = (streamName: string, hasAlertsAccess: boolean) => {
	const [, setStreamStore] = useStreamStore((_store) => null);
	const { data, isError, isSuccess, isLoading, refetch } = useQuery(
		['fetch-log-stream-alert', streamName, hasAlertsAccess],
		() => getLogStreamAlerts(streamName),
		{
			retry: false,
			enabled: streamName !== '' && hasAlertsAccess,
			refetchOnWindowFocus: false,
			onSuccess: (data) => {
				setStreamStore((store) => setAlertsConfig(store, data));
			},
		},
	);

	const { mutate: updateLogStreamAlerts } = useMutation(
		(data: { config: any; onSuccess?: () => void }) => putLogStreamAlerts(streamName, data.config),
		{
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
				refetch();
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
		data,
		isError,
		isSuccess,
		isLoading,
		refetch,
		updateLogStreamAlerts,
	};
};

export default useAlertsQuery;
