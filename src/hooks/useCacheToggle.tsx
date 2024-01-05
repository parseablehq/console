// import { useMutation, useQuery } from 'react-query';
// import { getCachingStatus, updateCaching } from '@/api/caching';

// const useCacheToggle = (streamName) => {
// 	const { data: checkCacheData } = useQuery(['fetch-cache-status', streamName], () => getCachingStatus(streamName), {
// 		onError: () =>
// 			notifyApi({
// 				/* ...error notification details... */
// 			}),
// 		retry: false,
// 		enabled: streamName !== '',
// 	});

// 	const { mutate: updateCacheStatus } = useMutation(({ type }) => updateCaching(streamName, type), {
// 		onSuccess: () =>
// 			notifyApi({
// 				/* ...success notification details... */
// 			}),
// 		onError: () =>
// 			notifyApi({
// 				/* ...error notification details... */
// 			}),
// 	});

// 	const handleCacheToggle = () => {
// 		updateCacheStatus({ type: !checkCacheData?.data });
// 	};

// 	return {
// 		isCacheEnabled: checkCacheData?.data,
// 		handleCacheToggle,
// 	};
// };
