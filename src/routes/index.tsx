import { ALL_ROUTE, HOME_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import NotFound from '@/pages/Errors/NotFound';
import type { FC } from 'react';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SuspensePage from './SuspensePage';
import PrivateRoute from './PrivateRoute';
import FullPageLayout from '@/layouts/FullPage';

const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));

const AppRouter: FC = () => {
	return (
		<FullPageLayout>
			<Routes>
				<Route element={<PrivateRoute />}>
					<Route
						path={HOME_ROUTE}
						element={
							<SuspensePage>
								<Home />
							</SuspensePage>
						}
					/>
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
