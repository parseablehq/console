import { useMutation } from 'react-query';
import { deleteLogStream } from '@/api/logStream';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';

export const useDeleteLogStream = () => {
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

	return {
		deleteLogStreamMutation,
		deleteLogStreamIsSuccess,
		deleteLogStreamIsError,
		deleteLogStreamIsLoading,
	};
};
