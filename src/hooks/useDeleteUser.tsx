import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { deleteUser } from '@/api/users';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

export const useDeleteUser = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const deleteUserFun = async (userName:string) => {
		try {
			setLoading(true);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Deleteing User',
				message: 'User will be Deleted.',
				autoClose: false,
				withCloseButton: false,
			});
			setError(null);
			const res = await deleteUser(userName);

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					notifications.update({
						id: 'load-data',
						color: 'green',
						title: 'User was Deleted',
						message: 'Successfully Deleted!!',
					icon: <IconCheck size="1rem" />,
						autoClose: 3000,
					});
					break;

				}
				default: {
					setError('Failed to get Roles');
					console.error(res);
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error Occured',
						message: 'Error Occured while Deleting User',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
				}
			}
		} catch(error) {
			setError('Failed to get Delete User');
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error Occured',
						message: 'Error Occured while Deleting User',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
			console.error(error);	
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, deleteUserFun, resetData };
};
