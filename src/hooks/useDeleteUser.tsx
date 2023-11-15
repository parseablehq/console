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
				title: 'Deleting user',
				message: 'User will be deleted.',
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
						title: 'User was deleted',
						message: 'Successfully deleted',
					icon: <IconCheck size="1rem" />,
						autoClose: 3000,
						loading:false
					});
					break;

				}
				default: {
					setError('Failed to get Roles');
					console.error(res);
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: 'Error occurred while deleting user',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
						loading:false
					});
				}
			}
		} catch(error) {
			setError('Failed to get delete user');
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: 'Error occurred while deleting user',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
						loading:false
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
