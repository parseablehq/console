import { useMutation, useQuery } from 'react-query';
import { getCachingStatus, updateCaching } from '@/api/caching';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';

export const useCacheToggle = (streamName: string) => {
	const { mutate: updateCacheStatus, isSuccess: updateCacheIsSuccess } = useMutation(
		({ type }: { type: boolean }) => updateCaching(streamName, type),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to change cache setting',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			onSuccess: () => {
				notifyApi({
					color: 'green',
					message: 'Succesfully updated cache setting',
					icon: <IconCheck size="1rem" />,
				});
			},
		},
	);

	const { data: checkCacheData } = useQuery(
		['fetch-cache-status', streamName, updateCacheIsSuccess],
		() => getCachingStatus(streamName),
		{
			retry: false,
			enabled: streamName !== '',
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
