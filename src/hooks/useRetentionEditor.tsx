import { useMutation, useQuery } from 'react-query';
import { getLogStreamRetention, putLogStreamRetention } from '@/api/logStream';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError } from 'axios';

export const useRetentionEditor = (streamName: string) => {
	const { mutate: updateLogStreamRetention } = useMutation((data: any) => putLogStreamRetention(streamName, data), {
		onSuccess: () => notifySuccess({ message: 'Updated Successfully' }),
		onError: (data: AxiosError) => {
			if (data.message) {
				notifyError({ message: data.message });
			}
		},
	});

	return {
		updateLogStreamRetention,
	};
};

export const useGetRetention = (streamName: string) => {
	const {
		data: getLogRetentionData,
		isError: getLogRetentionIsError,
		isLoading: getLogRetentionIsLoading,
		isSuccess: getLogRetentionIsSuccess,
	} = useQuery(['fetch-log-stream-retention', streamName], () => getLogStreamRetention(streamName), {
		onSuccess: () => {},
		retry: false,
		enabled: streamName !== '',
		refetchOnWindowFocus: false,
	});
	return {
		getLogRetentionData,
		getLogRetentionIsLoading,
		getLogRetentionIsError,
		getLogRetentionIsSuccess,
	};
};
