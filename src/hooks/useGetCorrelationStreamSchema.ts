import { getLogStreamSchema } from '@/api/logStream';
import { AxiosError, isAxiosError } from 'axios';
import _ from 'lodash';
import { useQueries, useQuery } from 'react-query';
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
	};
};

// Multiple stream schemas hook
export const useGetMultipleStreamSchemas = (streams: string[]) => {
	const [, setCorrelationStore] = useCorrelationStore((_store) => null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const queries = useQueries(
		streams.map((streamName) => ({
			queryKey: ['stream-schema', streamName],
			queryFn: () => getLogStreamSchema(streamName),
			retry: false,
			enabled: streamName !== '' && streamName !== 'correlatedStream',
			refetchOnWindowFocus: false,
			onSuccess: (data: any) => {
				setErrors((prev) => _.omit(prev, streamName));
				setCorrelationStore((store) => setStreamSchema(store, data.data, streamName));
			},
			onError: (error: AxiosError) => {
				let errorMessage = 'An unknown error occurred';
				if (isAxiosError(error) && error.response?.data) {
					errorMessage = typeof error.response.data === 'string' ? error.response.data : error.message;
				}
				setErrors((prev) => ({
					...prev,
					[streamName]: errorMessage,
				}));
			},
		})),
	);

	const isLoading = queries.some((query) => query.isLoading);
	const isError = queries.some((query) => query.isError);
	const isSuccess = queries.every((query) => query.isSuccess);
	const isRefetching = queries.some((query) => query.isRefetching);

	return {
		isLoading,
		isError,
		isSuccess,
		isRefetching,
		errors,
	};
};
