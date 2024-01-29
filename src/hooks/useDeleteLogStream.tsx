import { useMutation } from 'react-query';
import { deleteLogStream } from '@/api/logStream';

export const useDeleteLogStream = () => {
	const {
		mutate: deleteLogStreamMutation,
		isSuccess: deleteLogStreamIsSuccess,
		isError: deleteLogStreamIsError,
		isLoading: deleteLogStreamIsLoading,
	} = useMutation((data: { deleteStream: string }) => deleteLogStream(data.deleteStream), {});

	return {
		deleteLogStreamMutation,
		deleteLogStreamIsSuccess,
		deleteLogStreamIsError,
		deleteLogStreamIsLoading,
	};
};
