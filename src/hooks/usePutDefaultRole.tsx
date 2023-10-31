import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';

import { putDeafultRole } from '@/api/roles';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

export const usePutDefaultRole = () => {
	const [data, setData] = useMountedState<{
		data: any;
	} | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const setDefaultRole = async (payload: string) => {
		try {
			setLoading(true);
			setError(null);
			notifications.show({
				id: 'put-default-role',
				loading: true,
				color: '#545BEB',
				title: 'Setting Default Role for oidc users',
				message: 'Data will be loaded.',
				autoClose: false,
				withCloseButton: false,
			});

			const response = await putDeafultRole(payload);

			if (response.status === StatusCodes.OK) {
				setData({ data: payload });
				notifications.update({
					id: 'put-default-role',
					color: 'green',
					title: 'Default Role Set',
					message: 'Successfully Set',
					icon: <IconCheck size="1rem" />,
					autoClose: 1000,
				});

				return;
			}

			notifications.update({
				id: 'put-default-role',
				color: 'red',
				title: 'Error occurred',
				message: 'Error occurred, please check role and try again',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
			setError(response.data);
		} catch (error: any) {
			notifications.update({
				id: 'put-default-role',
				color: 'red',
				title: 'Error occurred',
				message: `Error: ${error.message}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, setDefaultRole, resetData };
};
