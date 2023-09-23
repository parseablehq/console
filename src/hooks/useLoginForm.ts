import { loginIn } from '@/api/auth';
import { notifyError } from '@/utils/notification';
import { useForm } from '@mantine/form';
import { hideNotification } from '@mantine/notifications';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useLocation, useNavigate } from 'react-router-dom';
import { HOME_ROUTE } from '@/constants/routes';
import { useId } from '@mantine/hooks';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { getQueryParam } from '@/utils';

export const useLoginForm = () => {
	const notificationId = useId();
	const queryParams = getQueryParam();
	const [loading, setLoading] = useMountedState(false);
	const [error, setError] = useMountedState<string | null>(null);
	const auth = Cookies.get('session');
	const nav = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (auth) {
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
			username: queryParams.username ?? '',
			password: queryParams.password ?? '',
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
						const pathname = location.state?.from?.pathname || HOME_ROUTE;
						console.log(pathname, 'pathname');
						nav(
							{
								pathname: '/',
							},
							{ replace: true },
						);

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
