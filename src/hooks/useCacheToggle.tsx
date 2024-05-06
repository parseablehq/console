import { useMutation, useQuery } from 'react-query';
import { getCachingStatus, updateCaching } from '@/api/caching';
import { notifySuccess } from '@/utils/notification';

export const useCacheToggle = (streamName: string) => {
	const {
		data: checkCacheData,
		refetch: getCacheStatusRefetch,
		isError: getCacheError,
	} = useQuery(['fetch-cache-status', streamName], () => getCachingStatus(streamName), {
		retry: false,
		enabled: streamName !== '',
		refetchOnWindowFocus: false,
	});

	const { mutate: updateCacheStatus } = useMutation(
		({ type }: { type: boolean; onSuccess: () => void }) => updateCaching(streamName, type),
		{
			onSuccess: (_data, variables) => {
				notifySuccess({ message: `Cache status modified successfully` });
				getCacheStatusRefetch();
				variables.onSuccess && variables.onSuccess();
			},
		},
	);

	return {
		isCacheEnabled: checkCacheData?.data,
		getCacheError,
		updateCacheStatus,
	};
};
