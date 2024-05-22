import { useQuery } from 'react-query';
import { getLogStreamStats } from '@/api/logStream';
import { Dayjs } from 'dayjs';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';

const { setStats } = streamStoreReducers;

export const useLogStreamStats = (streamName: string, fetchStartTime?: Dayjs) => {
	const [, setStreamStore] = useStreamStore((_store) => null);
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
		refetchOnWindowFocus: false,
	});

	return {
		getLogStreamStatsData,
		getLogStreamStatsDataIsSuccess,
		getLogStreamStatsDataIsLoading,
		getLogStreamStatsDataIsError,
	};
};
