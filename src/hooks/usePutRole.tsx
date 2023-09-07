import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { putRole } from '@/api/roles';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

export const usePutRole = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const putRolePrivilege = async (roleName: string, privilege: object[]) => {
		try {
			setLoading(true);
			setError(null);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'updating/creating Role',
				message: 'Role will be updated/created.',
				autoClose: false,
				withCloseButton: false,
			});
			const res = await putRole(roleName, privilege);

			switch (res.status) {
				case StatusCodes.OK: {
					setData("Role was updated/created");
					notifications.update({
						id: 'load-data',
						color: 'green',
						title: 'Role was updated/created',
						message: 'Successfully updated/created',
					icon: <IconCheck size="1rem" />,
						autoClose: 3000,
					});
					break;
				}
				default: {
					setError('Failed to put Role');
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: 'Error occurred while updated/created Role',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
					console.error(res);
				}
			}
		} catch (error) {
			setError('Failed to get Role');
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error occurred',
				message: 'Error occurred while updated/created Role',
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

	return { data, error, loading, putRolePrivilege, resetData };
};
