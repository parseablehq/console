import { ALL_ROUTE, HOME_ROUTE, LOGIN_ROUTE, LOGS_ROUTE, QUERY_ROUTE} from '@/constants/routes';
import FullPageLayout from '@/layouts/FullPageLayout';
import MainLayout from '@/layouts/MainLayout';
import NotFound from '@/pages/Errors/NotFound';
import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { HomeElement, LoginElement, LogsElement, QueryElement} from './elements';

const AppRouter: FC = () => {
	return (
		<FullPageLayout>
			<Routes>
				<Route element={<PrivateRoute />}>
					<Route element={<MainLayout />}>
						<Route path={HOME_ROUTE} element={<HomeElement />} />
						<Route path={LOGS_ROUTE} element={<LogsElement />} />
						<Route path={QUERY_ROUTE} element={<QueryElement />} />
					</Route>
				</Route>
				<Route path={LOGIN_ROUTE} element={<LoginElement />} />
				<Route path={ALL_ROUTE} element={<NotFound />} />
			</Routes>
		</FullPageLayout>
	);
};

export default AppRouter;
