import { PATHS } from '@/constants/routes';
import { matchRoutes, useLocation } from 'react-router-dom';

const routes = Object.keys(PATHS).map((key: string) => {
	const value = PATHS[key];
	return { path: value };
});

const getCurrentRoute = () => {
	const location = window.location;
	const match = matchRoutes(routes, { pathname: location.pathname });

	if (!match) {
		return '';
	} else {
		return match[0].route.path;
	}
};

export default getCurrentRoute;
