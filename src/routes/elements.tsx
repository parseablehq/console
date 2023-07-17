import Home from '@/pages/Home';
import LogsPageProvider from '@/pages/Logs/Context';
import type { FC } from 'react';
import { lazy } from 'react';
import SuspensePage from './SuspensePage';
import QueryPageProvider from '@/pages/Query/Context';
import MainLayoutPageProvider from '@/layouts/MainLayout/Context';
import MainLayout from '@/layouts/MainLayout';

export const HomeElement: FC = () => <Home />;

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
				<Logs />
			</LogsPageProvider>
		</SuspensePage>
	);
};

const Query = lazy(() => import('@/pages/Query'));

export const QueryElement: FC = () => {
	return (
		<SuspensePage>
			<QueryPageProvider>
				<Query />
			</QueryPageProvider>
		</SuspensePage>
	);
};



export const MainLayoutElement: FC = () => {
	return (

			<MainLayoutPageProvider >
				<MainLayout />
			</MainLayoutPageProvider>
	);
}
