import { useQuery } from 'react-query';
import { getLogStreamStats } from '@/api/logStream';
import { Dayjs } from 'dayjs';

export const useLogStreamStats = (streamName: string, fetchStartTime?: Dayjs) => {
	const {
		data: getLogStreamStatsData,
		isSuccess: getLogStreamStatsDataIsSuccess,
		isError: getLogStreamStatsDataIsError,
		isLoading: getLogStreamStatsDataIsLoading,
	} = useQuery(['fetch-log-stream-stats', streamName, fetchStartTime], () => getLogStreamStats(streamName), {
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
