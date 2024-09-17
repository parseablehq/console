import { useMutation, useQuery } from 'react-query';
import { notifyError, notifySuccess } from '@/utils/notification';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';
import { deleteHotTierInfo, getHotTierInfo, updateHotTierInfo } from '@/api/logStream';
import { AxiosError, isAxiosError } from 'axios';

const { setHotTier } = streamStoreReducers;

export const useHotTier = (streamName: string, hasSettingsAccess: boolean) => {
	const [, setStreamStore] = useStreamStore((_store) => null);
	const {
		refetch: refetchHotTierInfo,
		isError: getHotTierInfoError,
		isLoading: getHotTierInfoLoading,
	} = useQuery(['fetch-hot-tier-info', streamName], () => getHotTierInfo(streamName), {
		retry: false,
		enabled: streamName !== '' && hasSettingsAccess,
		refetchOnWindowFocus: false,
		onSuccess: (data) => {
			setStreamStore((store) => setHotTier(store, data.data));
		},
		onError: () => setStreamStore((store) => setHotTier(store, {})),
	});

	const { mutate: updateHotTier, isLoading: isUpdating } = useMutation(
		({ size }: { size: string; onSuccess?: () => void }) => updateHotTierInfo(streamName, { size }),
		{
			onSuccess: (_data, variables) => {
				notifySuccess({ message: `Hot tier size modified successfully` });
				refetchHotTierInfo();
				variables.onSuccess && variables.onSuccess();
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response?.data as string;
					typeof error === 'string' && notifyError({ message: error });
				} else if (data.message && typeof data.message === 'string') {
					notifyError({ message: data.message, autoClose: 5000 });
				}
			},
		},
	);

	const { mutate: deleteHotTier, isLoading: isDeleting } = useMutation(
		(_opts: { onSuccess?: () => void }) => deleteHotTierInfo(streamName),
		{
			onSuccess: (_data, variables) => {
				notifySuccess({ message: `Hot tier config deleted successfully` });
				refetchHotTierInfo();
				variables.onSuccess && variables.onSuccess();
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response?.data as string;
					typeof error === 'string' && notifyError({ message: error });
				} else if (data.message && typeof data.message === 'string') {
					notifyError({ message: data.message, autoClose: 5000 });
				}
			},
		},
	);

	return {
		getHotTierInfoError,
		getHotTierInfoLoading,
		updateHotTier,
		deleteHotTier,
		isDeleting,
		isUpdating,
	};
};
