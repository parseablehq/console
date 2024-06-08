import { getLogStreamInfo } from '@/api/logStream';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';
import { useQuery } from 'react-query';

const { setStreamInfo } = streamStoreReducers;

export const useGetStreamInfo = (currentStream: string) => {
	const [, setStreamStore] = useStreamStore((_store) => null);
	const {
		data: getStreamInfoData,
		isError: getStreamInfoError,
		isSuccess: getStreamInfoSuccess,
		isLoading: getStreamInfoLoading,
	} = useQuery(['stream-info', currentStream], () => getLogStreamInfo(currentStream), {
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		enabled: currentStream !== '',
		onSuccess: (data) => setStreamStore((store) => setStreamInfo(store, data)),
	});

	return {
		getStreamInfoData,
		getStreamInfoError,
		getStreamInfoSuccess,
		getStreamInfoLoading,
	};
};
