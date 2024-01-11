import { useQuery } from 'react-query';
import { getLogStreamStats } from '@/api/logStream';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';

export const useLogStreamStats = (streamName: string) => {
	const {
		data: getLogStreamStatsData,
		isSuccess: getLogStreamStatsDataIsSuccess,
		isError: getLogStreamStatsDataIsError,
		isLoading: getLogStreamStatsDataIsLoading,
	} = useQuery(['fetch-log-stream-stats', streamName], () => getLogStreamStats(streamName), {
		onError: () => {
			notifyApi({
				color: 'red',
				message: 'Failed to get log streams stats',
				icon: <IconFileAlert size="1rem" />,
			});
		},
		onSuccess: () => {
			notifyApi({
				color: 'green',
				message: 'Successfully fetched log streams stats',
				icon: <IconCheck size="1rem" />,
			});
		},
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
