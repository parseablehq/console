import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { getDefaultRole } from '@/api/roles';
import { notifications } from '@mantine/notifications';
import { IconFileAlert } from '@tabler/icons-react';

export const useGetDefaultRole = () => {
	const [data, setData] = useMountedState<string | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getDefaultOidc = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await getDefaultRole();

			switch (res.status) {
				case StatusCodes.OK: {
					const streams = res.data;

					setData(streams);
					break;
				}
				default: {
					setError('Failed to get default role');
					notifications.show({
						id: 'get-default-role',
						color: 'red',
						title: 'Error occurred',
						message: 'Failed to get default role',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
				}
			}
		} catch {
			setError('Failed to get default role');
			notifications.show({
				id: 'get-default-role',
				color: 'red',
				title: 'Error occurred',
				message: 'Failed to get default role',
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

	return { data, error, loading, getDefaultOidc, resetData };
};
