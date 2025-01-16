// import { useMutation, useQuery } from 'react-query';
// import { getCachingStatus, updateCaching } from '@/api/caching';
// import { notifySuccess } from '@/utils/notification';
// import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';

// const { setCacheEnabled } = streamStoreReducers;

// export const useCacheToggle = (streamName: string) => {
// 	const [, setStreamStore] = useStreamStore(() => null);
// 	const {
// 		data: checkCacheData,
// 		refetch: getCacheStatusRefetch,
// 		isError: getCacheError,
// 		isLoading: getCacheLoading,
// 	} = useQuery(['fetch-cache-status', streamName], () => getCachingStatus(streamName), {
// 		retry: false,
// 		enabled: streamName !== '',
// 		refetchOnWindowFocus: false,
// 		onSuccess: (data) => {
// 			setStreamStore((store) => setCacheEnabled(store, data.data));
// 		},
// 	});

// 	const { mutate: updateCacheStatus } = useMutation(
// 		({ type }: { type: boolean; onSuccess?: () => void }) => updateCaching(streamName, type),
// 		{
// 			onSuccess: (_data, variables) => {
// 				notifySuccess({ message: `Cache status modified successfully` });
// 				getCacheStatusRefetch();
// 				variables.onSuccess && variables.onSuccess();
// 			},
// 		},
// 	);

// 	return {
// 		isCacheEnabled: checkCacheData?.data,
// 		getCacheError,
// 		updateCacheStatus,
// 		getCacheLoading,
// 	};
// };
