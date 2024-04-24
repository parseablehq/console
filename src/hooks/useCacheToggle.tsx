import { useMutation, useQuery } from 'react-query';
import { getCachingStatus, updateCaching } from '@/api/caching';

export const useCacheToggle = (streamName: string) => {
	const { data: checkCacheData, refetch: getCacheStatusRefetch } = useQuery(
		['fetch-cache-status', streamName],
		() => getCachingStatus(streamName),
		{
			retry: false,
			enabled: streamName !== '',
			refetchOnWindowFocus: false,
		},
	);

	const { mutate: updateCacheStatus } = useMutation(({ type }: { type: boolean }) => updateCaching(streamName, type), {
		onSuccess: () => getCacheStatusRefetch(),
	});

	const handleCacheToggle = (val: boolean) => {
		updateCacheStatus({ type: val });
	};

	return {
		isCacheEnabled: checkCacheData?.data,
		handleCacheToggle,
	};
};