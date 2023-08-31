import { LogStreamData } from '@/@types/parseable/api/stream';

import { getLogStreamList } from '@/api/logStream';
import { StatusCodes } from 'http-status-codes';
import { useEffect } from 'react';
import useMountedState from './useMountedState';
import { notifications } from '@mantine/notifications';
import { IconFileAlert, IconCheck } from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '@/constants/routes';
import Cookies from 'js-cookie';

export const useGetLogStreamList = () => {
	const [data, setData] = useMountedState<LogStreamData | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
	const [, , removeCredentials] = useLocalStorage({ key: 'credentials' });
	const [, , removeUsername] = useLocalStorage({ key: 'username' });
	const navigate = useNavigate();

	const getData = async () => {
		try {
			setLoading(true);
			setError(null);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Fetching Streams',
				message: 'Streams will be loaded.',
				autoClose: false,
				withCloseButton: false,
			});
			const res = await getLogStreamList();

			switch (res.status) {
				case StatusCodes.OK: {
					const streams = res.data;

					setData(streams);
					if (streams && Boolean(streams.length)) {
						notifications.update({
							id: 'load-data',
							color: 'green',
							title: 'Streams was loaded',
							message: 'Successfully Loaded',
							icon: <IconCheck size="1rem" />,
							autoClose: 1000,
						});
					}

					if (streams && streams.length === 0) {
						notifications.update({
							id: 'load-data',
							color: 'red',
							title: 'No Streams',
							message: 'No Streams Found in your account',
							icon: <IconFileAlert size="1rem" />,
							autoClose: 2000,
						});
					}
					break;
				}
				case StatusCodes.UNAUTHORIZED: {
					setError('Unauthorized');
					Cookies.remove('session');
					Cookies.remove('username');
					console.log(Cookies.get());
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: 'Unauthorized',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});

					removeCredentials();
					removeUsername();
					navigate(
						{
							pathname: LOGIN_ROUTE,
						},
						{ replace: true },
					);

					break;
				}
				default: {
					setError('Failed to get log streams');
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: 'Error occurred while fetching streams',
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
				}
			}
		} catch {
			setError('Failed to get log streams');
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error occurred',
				message: 'Error occurred while fetching streams',
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

	useEffect(() => {
		getData();
	}, []);

	return { data, error, loading, getData, resetData };
};
