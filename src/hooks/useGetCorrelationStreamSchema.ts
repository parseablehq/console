import { getLogStreamSchema } from '@/api/logStream';
import { AxiosError, isAxiosError } from 'axios';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { correlationStoreReducers, useCorrelationStore } from '@/pages/Correlation/providers/CorrelationProvider';

const { setStreamSchema } = correlationStoreReducers;

export const useGetStreamSchema = (opts: { streamName: string }) => {
	const { streamName } = opts;
	const [, setCorrelationStore] = useCorrelationStore((_store) => null);

	const [errorMessage, setErrorMesssage] = useState<string | null>(null);

	const { isError, isSuccess, isLoading, isRefetching } = useQuery(
		['stream-schema', streamName],
		() => getLogStreamSchema(streamName),
		{
			retry: false,
			enabled: streamName !== '' && streamName !== 'correlatedStream',
			refetchOnWindowFocus: false,
			onSuccess: (data) => {
				setErrorMesssage(null);
				setCorrelationStore((store) => setStreamSchema(store, data.data, streamName));
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
		isSuccess,
		isError,
		isLoading,
		errorMessage,
		isRefetching,
		streamName,
	};
};
