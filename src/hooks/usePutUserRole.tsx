import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { putUserRoles } from '@/api/users';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import Cookies from 'js-cookie';

const parseable_session = import.meta.env.VITE_PARSEABLE_SESSION ?? 'parseable_session';
const parseable_user= import.meta.env.VITE_PARSEABLE_USER ?? 'parseable_user';

export const usePutUserRole = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const putRole = async (userName: string, roles: any) => {
		try {
			setLoading(true);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Updating user',
				message: 'User will be updated soon.',
				autoClose: false,
				withCloseButton: false,
			});
			setError(null);
			const res = await putUserRoles(userName, roles);

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					notifications.update({
						id: 'load-data',
						color: 'green',
						title: 'Updated user',
						message: 'Successfully updated',
						icon: <IconCheck size="1rem" />,
						autoClose: 3000,
					});
					break;
				}
				default: {
					setError(res.data);
					console.error(res);
					Cookies.remove(parseable_session);
					Cookies.remove(parseable_user);
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: res.data,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
				}
			}
		} catch (error) {
			setError('Failed to get create user');
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error occurred',
				message: 'Error occurred while updating user role(s)',
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

	return { data, error, loading, putRole, resetData };
};
