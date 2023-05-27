import { DASHBOARD_ROUTE } from '@/constants/routes';
import type { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const Home: FC = () => {
	const location = useLocation();
	const pathname = location.state?.from?.pathname ?? DASHBOARD_ROUTE;

	return <Navigate to={{ pathname }} />;
};

export default Home;
