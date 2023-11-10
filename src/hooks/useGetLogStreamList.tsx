import { getLogStreamList } from '@/api/logStream';
import { StatusCodes } from 'http-status-codes';
import { useEffect } from 'react';
import useMountedState from './useMountedState';
import { notifications } from '@mantine/notifications';
import { IconFileAlert, IconCheck } from '@tabler/icons-react';

import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '@/constants/routes';
import Cookies from 'js-cookie';

export const useGetLogStreamList = () => {
	const [data, setData] = useMountedState<string[] | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
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
					const streams = res.data.map((stream) => stream.name);
					streams.sort((a, b) => {
						const nameA = a.toUpperCase();
						const nameB = b.toUpperCase();
						if (nameA < nameB) {
							return -1;
						}
						if (nameA > nameB) {
							return 1;
						}
						return 0;
					});

					setData(streams);
					if (streams && Boolean(streams.length)) {
						notifications.update({
							id: 'load-data',
							color: 'green',
							title: 'Streams was loaded',
							message: 'Successfully Loaded',
							icon: <IconCheck size="1rem" />,
							autoClose: 1000,
							loading: false,
						});
					}

					if (streams && streams.length === 0) {
						notifications.update({
							id: 'load-data',
							color: 'red',
							title: 'No Streams',
							message: 'No Streams Found in your account',
							icon: <IconFileAlert size="1rem" />,
							loading: false,
							autoClose: 2000,
						});
					}
					break;
				}
				case StatusCodes.UNAUTHORIZED: {
					setError('Unauthorized');
					Cookies.remove('session');
					Cookies.remove('username');

					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: 'Unauthorized',
						loading: false,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
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
						loading: false,
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
				loading: false,
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
