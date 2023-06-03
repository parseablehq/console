import { loginIn } from '@/api/auth';
import { notifyError } from '@/utils/notification';
import { useForm } from '@mantine/form';
import { hideNotification } from '@mantine/notifications';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useLocation, useNavigate } from 'react-router-dom';
import { HOME_ROUTE } from '@/constants/routes';
import { useId, useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';

export const useLoginForm = () => {
	const notificationId = useId();

	const [loading, setLoading] = useMountedState(false);
	const [error, setError] = useMountedState<string | null>(null);
	const [credentials, setCredentials] = useLocalStorage({
		key: 'credentials',
		getInitialValueInEffect: false,
		serialize: (value) => {
			return value;
		},
	});
	const [, setUsername] = useLocalStorage({
		key: 'username',
		serialize: (value) => {
			return value;
		},
	});
	const nav = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (credentials) {
			nav(
				{
					pathname: HOME_ROUTE,
				},
				{ replace: true },
			);
		}
	}, []);

	const form = useForm({
		initialValues: {
			username: import.meta.env.VITE_PARSEABLE_USER ?? '',
			password: import.meta.env.VITE_PARSEABLE_PASS ?? '',
		},
		validate: {
			username: (value) => (value ? null : ''),
			password: (value) => (value ? null : ''),
		},
		transformValues: (values) => {
			return {
				username: values.username.trim(),
				password: values.password.trim(),
			};
		},
	});

	const handleSubmit = () => {
		return form.onSubmit(async (data) => {
			try {
				setLoading(true);
				setError(null);
				hideNotification(notificationId);

				const res = await loginIn(data.username, data.password);

				switch (res.status) {
					case StatusCodes.OK: {
						const credentials = btoa(`${data.username}:${data.password}`);
						setCredentials(credentials);
						setUsername(data.username);

						const pathname = location.state?.from?.pathname || HOME_ROUTE;

						nav({
							pathname,
						});

						break;
					}
					case StatusCodes.UNAUTHORIZED: {
						setError('Invalid credential');
						break;
					}
					default: {
						setError('Request Failed!');
					}
				}
			} catch (err) {
				notifyError({ id: notificationId });
			} finally {
				setLoading(false);
			}
		});
	};

	return { ...form, loading, handleSubmit, error };
};
