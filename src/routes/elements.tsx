import Home from '@/pages/Home';
import LogsPageProvider from '@/pages/Logs/Context';
import type { FC } from 'react';
import { lazy } from 'react';
import SuspensePage from './SuspensePage';

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