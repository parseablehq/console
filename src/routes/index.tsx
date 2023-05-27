import { ALL_ROUTE, DASHBOARD_ROUTE, HOME_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import NotFound from '@/pages/Errors/NotFound';
import type { FC } from 'react';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SuspensePage from './SuspensePage';
import PrivateRoute from './PrivateRoute';
import FullPageLayout from '@/layouts/FullPageLayout';
import MainLayout from '@/layouts/MainLayout';

const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

const AppRouter: FC = () => {
	return (
		<FullPageLayout>
			<Routes>
				<Route element={<PrivateRoute />}>
					<Route element={<MainLayout />}>
						<Route
							path={HOME_ROUTE}
							element={
								<SuspensePage>
									<Home />
								</SuspensePage>
							}
						/>
						<Route
							path={DASHBOARD_ROUTE}
							element={
								<SuspensePage>
									<Dashboard />
								</SuspensePage>
							}
						/>
					</Route>
				</Route>
				<Route
					path={LOGIN_ROUTE}
					element={
						<SuspensePage>
							<Login />
						</SuspensePage>
					}
				/>
				<Route path={ALL_ROUTE} element={<NotFound />} />
			</Routes>
		</FullPageLayout>
	);
};

export default AppRouter;
