import { useMutation, useQuery } from 'react-query';
import { getCachingStatus, updateCaching } from '@/api/caching';

export const useCacheToggle = (streamName: string) => {
	const { mutate: updateCacheStatus, isSuccess: updateCacheIsSuccess } = useMutation(
		({ type }: { type: boolean }) => updateCaching(streamName, type),
		{},
	);

	const { data: checkCacheData } = useQuery(
		['fetch-cache-status', streamName, updateCacheIsSuccess],
		() => getCachingStatus(streamName),
		{
			retry: false,
			enabled: streamName !== '',
			refetchOnWindowFocus: false
		},
	);

	const handleCacheToggle = () => {
		updateCacheStatus({ type: !checkCacheData?.data });
	};

	return {
		isCacheEnabled: checkCacheData?.data,
		handleCacheToggle,
	};
};
