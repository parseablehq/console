import { useMutation, useQuery } from 'react-query';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';
import { deleteLogStream, getLogStreamList } from '@/api/logStream';

export const useLogStream = () => {
	const {
		mutate: deleteLogStreamMutation,
		isSuccess: deleteLogStreamIsSuccess,
		isError: deleteLogStreamIsError,
		isLoading: deleteLogStreamIsLoading,
	} = useMutation((data: { deleteStream: string }) => deleteLogStream(data.deleteStream), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'Stream was deleted',
				message: 'Successfully Deleted',
				icon: <IconCheck size="1rem" />,
				autoClose: 8000,
			});
		},
		onError: () => {
			notifyApi(
				{
					color: 'red',
					title: 'Error occurred',
					message: 'Error occurred while deleting stream',
					icon: <IconFileAlert size="1rem" />,
					autoClose: 2000,
				},
				true,
			);
		},
	});

	const {
		data: getLogStreamListData,
		isError: getLogStreamListIsError,
		isSuccess: getLogStreamListIsSuccess,
		isLoading: getLogStreamListIsLoading,
		refetch: getLogStreamListRefetch,
	} = useQuery(['fetch-log-stream-list', deleteLogStreamIsSuccess], () => getLogStreamList(), {
		onError: () => {
			notifyApi({
				color: 'red',
				message: 'Failed to get log streams alert',
				icon: <IconFileAlert size="1rem" />,
			});
		},
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'Streams was loaded',
				message: 'Successfully Loaded',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
		},
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
