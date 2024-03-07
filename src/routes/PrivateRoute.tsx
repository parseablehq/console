import { LOGIN_ROUTE } from '@/constants/routes';
import type { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';


const PrivateRoute: FC = () => {
	const auth = Cookies.get('session') 
	const { pathname } = useLocation();

	return auth || true ? (
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
