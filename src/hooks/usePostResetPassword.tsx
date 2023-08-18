import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import {  postUserResetPassword } from '@/api/users';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

export const usePostUserResetPassword = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const resetPasswordUser = async (userName:string) => {
		try {
			setLoading(true);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Changing Password',
				message: 'Password will be Changed.',
				autoClose: false,
				withCloseButton: false,
			});
			setError(null);
			const res = await postUserResetPassword(userName);

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					notifications.update({
						id: 'load-data',
						color: 'green',
						title: 'Password was Changed',
						message: 'Successfully Changed!!',
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

	return { data, error, loading, resetPasswordUser, resetData };
};

