import {
	ALL_ROUTE,
	OIDC_NOT_CONFIGURED_ROUTE,
	LOGIN_ROUTE,
	CONFIG_ROUTE,
	HOME_ROUTE,
	LOGS_ROUTE,
	QUERY_ROUTE,
	STATS_ROUTE,
	USERS_MANAGEMENT_ROUTE,
} from '@/constants/routes';
import FullPageLayout from '@/layouts/FullPageLayout';
import NotFound from '@/pages/Errors/NotFound';
import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AccessSpecificRoute from './AccessSpecificRoute';
import {
	LoginElement,
	HomeElement,
	LogsElement,
	QueryElement,
	MainLayoutElement,
	StatsElement,
	ConfigElement,
	UsersElement,
} from './elements';

import OIDCNotConFigured from '@/pages/Errors/OIDC';

const AppRouter: FC = () => {
	return (
		<FullPageLayout>
			<Routes>
				<Route element={<PrivateRoute />} >
					<Route element={<MainLayoutElement />}>
						<Route path={HOME_ROUTE} element={<HomeElement />}  />

						<Route element={<AccessSpecificRoute accessRequired={['ListUser']} />}>
							<Route path={USERS_MANAGEMENT_ROUTE} element={<UsersElement />} />
						</Route>

						<Route element={<AccessSpecificRoute accessRequired={['Query', 'GetSchema']} />}>
							<Route path={LOGS_ROUTE} element={<LogsElement />} />
							{/* <Route path={QUERY_ROUTE} element={<QueryElement />} /> */}
						</Route>

						<Route element={<AccessSpecificRoute accessRequired={['GetStats']} />}>
							<Route path={STATS_ROUTE} element={<StatsElement />} />
						</Route>
						{/* <Route element={<AccessSpecificRoute accessRequired={['PutAlert']} />}>
							<Route path={CONFIG_ROUTE} element={<ConfigElement />} />
						</Route> */}
					</Route>
				</Route>
				<Route path={LOGIN_ROUTE} element={<LoginElement />} />
				<Route path={OIDC_NOT_CONFIGURED_ROUTE} element={<OIDCNotConFigured />} />
				<Route path={ALL_ROUTE} element={<NotFound />} />
			</Routes>
		</FullPageLayout>
	);
};

export default AppRouter;
