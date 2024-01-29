import { useQuery } from 'react-query';
import { getLogStreamStats } from '@/api/logStream';

export const useLogStreamStats = (streamName: string) => {
	const {
		data: getLogStreamStatsData,
		isSuccess: getLogStreamStatsDataIsSuccess,
		isError: getLogStreamStatsDataIsError,
		isLoading: getLogStreamStatsDataIsLoading,
	} = useQuery(['fetch-log-stream-stats', streamName], () => getLogStreamStats(streamName), {
		retry: false,
		enabled: streamName !== '',
	});

	return {
		getLogStreamStatsData,
		getLogStreamStatsDataIsSuccess,
		getLogStreamStatsDataIsLoading,
		getLogStreamStatsDataIsError,
	};
};
