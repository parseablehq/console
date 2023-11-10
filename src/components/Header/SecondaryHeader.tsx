import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import HeaderLayout from './Layout';
import { AllRouteHeader, ConfigHeader, LogsHeader, QueryHeader, StatsHeader, UsersManagementHeader } from './SubHeader';
import {
	ALL_ROUTE,
	CONFIG_ROUTE,
	HOME_ROUTE,
	LOGS_ROUTE,
	QUERY_ROUTE,
	STATS_ROUTE,
	USERS_MANAGEMENT_ROUTE,
} from '@/constants/routes';

type SecondaryHeaderProps = Omit<any, 'children' | 'height' | 'className'>;

const SecondaryHeader: FC<SecondaryHeaderProps> = (props) => {
	return (
		<Routes>
			<Route element={<HeaderLayout {...props} />}>
				<Route path={HOME_ROUTE} element={<AllRouteHeader />} />
				<Route path={LOGS_ROUTE} element={<LogsHeader />} />
				<Route path={QUERY_ROUTE} element={<QueryHeader />} />
				<Route path={STATS_ROUTE} element={<StatsHeader />} />
				<Route path={CONFIG_ROUTE} element={<ConfigHeader />} />
				<Route path={USERS_MANAGEMENT_ROUTE} element={<UsersManagementHeader />} />
				<Route path={ALL_ROUTE} element={<AllRouteHeader />} />
			</Route>
		</Routes>
	);
};

export default SecondaryHeader;
