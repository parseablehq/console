import { getLogStreamInfo } from '@/api/logStream';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';
import { notifyError } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import { useQuery } from 'react-query';

const { setStreamInfo } = streamStoreReducers;

export const useGetStreamInfo = (currentStream: string, initialFetch: boolean) => {
	const [, setStreamStore] = useStreamStore((_store) => null);
	const {
		data: getStreamInfoData,
		isError: getStreamInfoError,
		isSuccess: getStreamInfoSuccess,
		isLoading: getStreamInfoLoading,
		refetch: getStreamInfoRefetch,
		isRefetching: getStreamInfoRefetching,
	} = useQuery(['stream-info', currentStream], () => getLogStreamInfo(currentStream), {
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		enabled: initialFetch,
		onSuccess: (data) => {
			setStreamStore((store) => setStreamInfo(store, data));
		},
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response?.data as string;
				typeof error === 'string' && notifyError({ message: error });
			} else if (data.message && typeof data.message === 'string') {
				notifyError({ message: data.message });
			}
		},
	});

	return {
		getStreamInfoData,
		getStreamInfoError,
		getStreamInfoSuccess,
		getStreamInfoLoading,
		getStreamInfoRefetch,
		getStreamInfoRefetching,
	};
};
