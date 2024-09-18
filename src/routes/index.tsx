import {
	ALL_ROUTE,
	HOME_ROUTE,
	LOGIN_ROUTE,
	OIDC_NOT_CONFIGURED_ROUTE,
	USERS_MANAGEMENT_ROUTE,
	CLUSTER_ROUTE,
	STREAM_ROUTE,
	DASHBOARDS_ROUTE,
} from '@/constants/routes';
import FullPageLayout from '@/layouts/FullPageLayout';
import NotFound from '@/pages/Errors/NotFound';
import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import {
	HomeElement,
	LoginElement,
	StreamElement,
	MainLayoutElement,
	SystemsElement,
	UsersElement,
	DashboardsElement,
} from './elements';
import AccessSpecificRoute from './AccessSpecificRoute';
import OIDCNotConFigured from '@/pages/Errors/OIDC';

const AppRouter: FC = () => {
	return (
		<FullPageLayout>
			<Routes>
				<Route element={<PrivateRoute />}>
					<Route element={<MainLayoutElement />}>
						<Route path={HOME_ROUTE} element={<HomeElement />} />
						<Route path={DASHBOARDS_ROUTE} element={<DashboardsElement />} />
						<Route element={<AccessSpecificRoute accessRequired={['Users']} />}>
							<Route path={USERS_MANAGEMENT_ROUTE} element={<UsersElement />} />
						</Route>
						<Route element={<AccessSpecificRoute accessRequired={['Query', 'GetSchema']} />}>
							<Route path={STREAM_ROUTE} element={<StreamElement />} />
						</Route>
						<Route element={<AccessSpecificRoute accessRequired={['Cluster']} />}>
							<Route path={CLUSTER_ROUTE} element={<SystemsElement />} />
						</Route>
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
