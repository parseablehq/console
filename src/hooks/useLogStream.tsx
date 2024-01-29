import { useMutation, useQuery } from 'react-query';
import { deleteLogStream, getLogStreamList } from '@/api/logStream';

export const useLogStream = () => {
	const {
		mutate: deleteLogStreamMutation,
		isSuccess: deleteLogStreamIsSuccess,
		isError: deleteLogStreamIsError,
		isLoading: deleteLogStreamIsLoading,
	} = useMutation((data: { deleteStream: string }) => deleteLogStream(data.deleteStream), {});

	const {
		data: getLogStreamListData,
		isError: getLogStreamListIsError,
		isSuccess: getLogStreamListIsSuccess,
		isLoading: getLogStreamListIsLoading,
		refetch: getLogStreamListRefetch,
	} = useQuery(['fetch-log-stream-list', deleteLogStreamIsSuccess], () => getLogStreamList(), {
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});

	getLogStreamListData?.data.sort((a, b) => {
		const nameA = a.name.toUpperCase();
		const nameB = b.name.toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});

	return {
		deleteLogStreamMutation,
		deleteLogStreamIsSuccess,
		deleteLogStreamIsError,
		deleteLogStreamIsLoading,
		getLogStreamListData,
		getLogStreamListIsError,
		getLogStreamListIsSuccess,
		getLogStreamListIsLoading,
		getLogStreamListRefetch,
	};
};
