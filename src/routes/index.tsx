import {
	ALL_ROUTE,
	CONFIG_ROUTE,
	HOME_ROUTE,
	LIVE_TAIL_ROUTE,
	LOGIN_ROUTE,
	LOGS_ROUTE,
	OIDC_NOT_CONFIGURED_ROUTE,
	QUERY_ROUTE,
	STATS_ROUTE,
	USERS_MANAGEMENT_ROUTE,
} from '@/constants/routes';
import FullPageLayout from '@/layouts/FullPageLayout';
import NotFound from '@/pages/Errors/NotFound';
import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import {
	HomeElement,
	LoginElement,
	LogsElement,
	QueryElement,
	MainLayoutElement,
	StatsElement,
	ConfigElement,
	UsersElement,
	LiveTailElement,
} from './elements';
import AccessSpecificRoute from './AccessSpecificRoute';
import OIDCNotConFigured from '@/pages/Errors/OIDC';

const AppRouter: FC = () => {
	const isSecureConnection = window.location.protocol === 'https:';
	return (
		<FullPageLayout>
			<Routes>
				<Route element={<PrivateRoute />}>
					<Route element={<MainLayoutElement />}>
						{/* Cuurently working Empty Stream page sooner change to HomeElement */}
						<Route path={HOME_ROUTE} element={<HomeElement />} />

						{/* Users Management Route */}
						<Route element={<AccessSpecificRoute accessRequired={['ListUser']} />}>
							<Route path={USERS_MANAGEMENT_ROUTE} element={<UsersElement />} />
						</Route>

						<Route element={<AccessSpecificRoute accessRequired={['Query', 'GetSchema']} />}>
							<Route path={LOGS_ROUTE} element={<LogsElement />} />
							<Route path={QUERY_ROUTE} element={<QueryElement />} />
						</Route>
						{!isSecureConnection && (
							<Route element={<AccessSpecificRoute accessRequired={['GetLiveTail']} />}>
								<Route path={LIVE_TAIL_ROUTE} element={<LiveTailElement />} />
							</Route>
						)}
						<Route element={<AccessSpecificRoute accessRequired={['GetStats']} />}>
							<Route path={STATS_ROUTE} element={<StatsElement />} />
						</Route>
						<Route element={<AccessSpecificRoute accessRequired={['PutAlert']} />}>
							<Route path={CONFIG_ROUTE} element={<ConfigElement />} />
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
