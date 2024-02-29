import Home from '@/pages/Home';
import type { FC } from 'react';
import { lazy } from 'react';
import SuspensePage from './SuspensePage';
import MainLayoutPageProvider from '@/layouts/MainLayout/Context';
import MainLayout from '@/layouts/MainLayout';

// page-wise providers
import LogsPageProvider from '@/pages/Logs/logsContextProvider';

// component-wise providers
import QueryFilterProvider from '@/providers/QueryFilterProvider';

export const HomeElement: FC = () => {
	return (
		<SuspensePage>
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

const Users = lazy(() => import('@/pages/AccessManagement'));

export const UsersElement: FC = () => {
	return (
		<SuspensePage>
			<Users />
		</SuspensePage>
	);
};
