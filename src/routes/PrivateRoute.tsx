import { LOGIN_ROUTE } from '@/constants/routes';
import type { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
const parseable_session = import.meta.env.VITE_PARSEABLE_SESSION ?? 'parseable_session';

const PrivateRoute: FC = () => {
	const auth = Cookies.get(parseable_session);
	const { pathname } = useLocation();

	return auth ? (
		<Outlet />
	) : (
		<Navigate
			to={LOGIN_ROUTE}
			state={{
				from: {
					pathname,
				},
			}}
		/>
	);
};

export default PrivateRoute;
