import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { deleteRole } from '@/api/roles';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

export const useDeleteRole = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const deleteRoleFun = async (roleName: string) => {
		try {
			setLoading(true);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Deleting Role',
				message: 'Role will be deleted.',
				autoClose: false,
				withCloseButton: false,
			});
			setError(null);
			const res = await deleteRole(roleName);

			switch (res.status) {
				case StatusCodes.OK: {
					setData('Role was deleted');
					notifications.update({
						id: 'load-data',
						color: 'green',
						title: 'Role was deleted',
						message: 'Successfully deleted',
						icon: <IconCheck size="1rem" />,
						autoClose: 3000,
						loading: false,
					});
					break;
				}
				default: {
					setError('Failed to Delete Roles');
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: 'Error occurred while deleting Role',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
						loading: false,
					});
					console.error(res);
				}
			}
		} catch (error) {
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error occurred',
				message: 'Error occurred while deleting role',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
				loading: false,
			});
			setError('Failed to Delete Roles');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, deleteRoleFun, resetData };
};
