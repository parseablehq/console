import { deleteLogStream } from '@/api/logStream';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { notifications } from '@mantine/notifications';
import {  IconCheck, IconFileAlert } from '@tabler/icons-react';


export const useDeleteLogStream = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const deleteLogStreamFun = async (streamName: string) => {
		try {
			setLoading(true);
			notifications.show({
				id: 'delete-data',
				loading: true,
				color: '#545BEB',
				title: 'Deleting Stream',
				message: 'Stream will be deleted.',
				autoClose: false,
				withCloseButton: false,

			});
			setError(null);
			const res = await deleteLogStream(streamName);

			switch (res.status) {
				case StatusCodes.OK: {
					const streams = res.data;

					setData(streams);
					notifications.update({
						id: 'delete-data',
						color: 'green',
						title: 'Stream was deleted',
						message: 'Successfully Deleted!!',
						icon: <IconCheck size="1rem" />,
						autoClose: 8000,
					});
					break;

				}
				default: {
					setError('Failed to get ALert');
					notifications.update({
						id: 'delete-data',
						color: 'red',
						title: 'Error Occured',
						message: 'Error Occured while deleting stream',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
				}
			}
		} catch {
			setError('Failed to get ALert');
			notifications.update({
				id: 'delete-data',
				color: 'red',
				title: 'Error Occured',
				message: 'Error Occured while deleting stream',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, deleteLogStreamFun, resetData };
};
