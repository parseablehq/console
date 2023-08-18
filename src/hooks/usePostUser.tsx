import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { postUser } from '@/api/users';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

export const usePostUser = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const createUser = async (userName:string,roles?:object[]) => {
		try {
			setLoading(true);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Creating User',
				message: 'User will be Created.',
				autoClose: false,
				withCloseButton: false,
			});
			setError(null);
			const res = await postUser(userName,roles);

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					notifications.update({
						id: 'load-data',
						color: 'green',
						title: 'User was Created',
						message: 'Successfully created!!',
						icon: <IconCheck size="1rem" />,
						autoClose: 3000,
					});
					break;

				}
				default: {
					setError(res.data);
					console.error(res);
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error Occured',
						message: res.data,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
				}
			}
		} catch(error) {
			setError('Failed to get Create User');
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error Occured',
						message: 'Error Occured while Creating User',
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

	return { data, error, loading, createUser, resetData };
};

