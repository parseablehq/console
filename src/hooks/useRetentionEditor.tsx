import { useMutation, useQuery } from 'react-query';
import { getLogStreamRetention, putLogStreamRetention } from '@/api/logStream';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';
import _ from 'lodash';

const { setRetention } = streamStoreReducers;

export const useRetentionQuery = (streamName: string, hasSettingsAccess: boolean) => {
	const [, setStreamStore] = useStreamStore((_store) => null);
	const {
		data: getLogRetentionData,
		isError: getLogRetentionIsError,
		isLoading: getLogRetentionIsLoading,
		isSuccess: getLogRetentionIsSuccess,
		refetch: getLogRetentionDataRefetch,
	} = useQuery(['fetch-log-stream-retention', streamName], () => getLogStreamRetention(streamName), {
		onSuccess: (data) => {
			const retentionData = _.isArray(data.data) ? data.data[0] || {} : {};
			setStreamStore((store) => setRetention(store, retentionData));
		},
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response?.data as string;
				typeof error === 'string' && notifyError({ message: error });
			} else if (data.message && typeof data.message === 'string') {
				notifyError({ message: data.message });
			}
		},
		retry: false,
		enabled: streamName !== '' && hasSettingsAccess,
		refetchOnWindowFocus: false,
	});

	const { mutate: updateLogStreamRetention } = useMutation(
		(data: { config: any; onSuccess?: () => void }) => putLogStreamRetention(streamName, data.config),
		{
			onSuccess: (_data, variables) => {
				notifySuccess({ message: 'Updated Successfully' });
				getLogRetentionDataRefetch();
				variables.onSuccess && variables.onSuccess();
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
		getLogRetentionData,
		getLogRetentionIsLoading,
		getLogRetentionIsError,
		getLogRetentionIsSuccess,
		getLogRetentionDataRefetch,
		updateLogStreamRetention,
	};
};
