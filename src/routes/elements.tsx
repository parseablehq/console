import Home from '@/pages/Home';
import type { FC } from 'react';
import { lazy } from 'react';
import SuspensePage from './SuspensePage';
import MainLayoutPageProvider from '@/layouts/MainLayout/Context';
import MainLayout from '@/layouts/MainLayout';
import {
	ConfigHeader,
	HomeHeader,
	LiveTailHeader,
	LogsHeader,
	StatsHeader,
	UsersManagementHeader,
} from '@/components/Header/SubHeader';

// page-wise providers
import LogsPageProvider from '@/pages/Logs/context';
import StatsPageProvider from '@/pages/Stats/Context';

// component-wise providers
import QueryFilterProvider from '@/providers/QueryFilterProvider';

export const HomeElement: FC = () => {
	return (
		<SuspensePage>
			<HomeHeader />
			<Home />
		</SuspensePage>
	);
};

const Login = lazy(() => import('@/pages/Login'));

export const LoginElement: FC = () => {
	return (
		<SuspensePage>
			<Login />
		</SuspensePage>
	);
};

const Logs = lazy(() => import('@/pages/Logs'));

export const LogsElement: FC = () => {
	return (
		<SuspensePage>
			<LogsPageProvider>
				<QueryFilterProvider>
					{/* <LogsHeader /> */}
					<Logs />
				</QueryFilterProvider>
			</LogsPageProvider>
		</SuspensePage>
	);
};

export const MainLayoutElement: FC = () => {
	return (
		<MainLayoutPageProvider>
			<MainLayout />
		</MainLayoutPageProvider>
	);
};

const LiveTail = lazy(() => import('@/pages/LiveTail'));

export const LiveTailElement: FC = () => {
	return (
		<SuspensePage>
			<LiveTailHeader />
			<LiveTail />
		</SuspensePage>
	);
};

const Stats = lazy(() => import('@/pages/Stats'));

export const StatsElement: FC = () => {
	return (
		<SuspensePage>
			<StatsPageProvider>
				<StatsHeader />
				<Stats />
			</StatsPageProvider>
		</SuspensePage>
	);
};

const Config = lazy(() => import('@/pages/Config'));

export const ConfigElement: FC = () => {
	return (
		<SuspensePage>
			<ConfigHeader />
			<Config />
		</SuspensePage>
	);
};

const Users = lazy(() => import('@/pages/AccessManagement'));

export const UsersElement: FC = () => {
	return (
		<SuspensePage>
			<UsersManagementHeader />
			<Users />
		</SuspensePage>
	);
};
