import { useQuery } from 'react-query';
import { getLogStreamStats } from '@/api/logStream';
import { Dayjs } from 'dayjs';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';
import { notifyError } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';

const { setStats } = streamStoreReducers;

export const useLogStreamStats = (streamName: string, fetchStartTime?: Dayjs) => {
	const [, setStreamStore] = useStreamStore(() => null);
	const {
		data: getLogStreamStatsData,
		isSuccess: getLogStreamStatsDataIsSuccess,
		isError: getLogStreamStatsDataIsError,
		isLoading: getLogStreamStatsDataIsLoading,
	} = useQuery(['fetch-log-stream-stats', streamName, fetchStartTime], () => getLogStreamStats(streamName), {
		retry: false,
		enabled: streamName !== '',
		onSuccess: (data) => {
			setStreamStore((store) => setStats(store, data));
		},
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response?.data as string;
				typeof error === 'string' && notifyError({ message: error });
			} else if (data.message && typeof data.message === 'string') {
				notifyError({ message: data.message });
			}
		},
		refetchOnWindowFocus: false,
	});

	return {
		getLogStreamStatsData,
		getLogStreamStatsDataIsSuccess,
		getLogStreamStatsDataIsLoading,
		getLogStreamStatsDataIsError,
	};
};
