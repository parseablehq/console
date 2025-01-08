import { getLogStreamSchema } from '@/api/logStream';
import { useStreamStore, streamStoreReducers } from '@/pages/Stream/providers/StreamProvider';
import { AxiosError, isAxiosError } from 'axios';
import { useQuery } from 'react-query';
import { useState } from 'react';

const { setStreamSchema } = streamStoreReducers;

export const useGetStreamSchema = (opts: { streamName: string }) => {
	const { streamName } = opts;
	const [, setStreamStore] = useStreamStore(() => null);
	const [errorMessage, setErrorMesssage] = useState<string | null>(null);

	const { isError, isSuccess, isLoading, refetch, isRefetching } = useQuery(
		['stream-schema', streamName],
		() => getLogStreamSchema(streamName),
		{
			retry: false,
			enabled: false,
			refetchOnWindowFocus: false,
			onSuccess: (data) => {
				setErrorMesssage(null);
				setStreamStore((store) => setStreamSchema(store, data.data));
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response?.data as string;
					typeof error === 'string' && setErrorMesssage(error);
				} else if (data.message && typeof data.message === 'string') {
					setErrorMesssage(data.message);
				}
			},
		},
	);

	return {
		refetch,
		isSuccess,
		isError,
		isLoading,
		errorMessage,
		isRefetching,
	};
};
