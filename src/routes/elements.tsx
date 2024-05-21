import Home from '@/pages/Home';
import type { FC } from 'react';
import { lazy } from 'react';
import SuspensePage from './SuspensePage';
import MainLayout from '@/layouts/MainLayout';
import { AppProvider } from '@/layouts/MainLayout/providers/AppProvider';
import { LogsProvider } from '@/pages/Stream/providers/LogsProvider';
import { FilterProvider } from '@/pages/Stream/providers/FilterProvider';
import { ManagementProvider } from '@/pages/Stream/providers/ManageProvider';
import { StreamProvider } from '@/pages/Stream/providers/StreamProvider';

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

const Logs = lazy(() => import('@/pages/Stream'));

export const LogsElement: FC = () => {
	return (
		<SuspensePage>
			<StreamProvider>
				<LogsProvider>
					<FilterProvider>
						<ManagementProvider>
							<Logs />
						</ManagementProvider>
					</FilterProvider>
				</LogsProvider>
			</StreamProvider>
		</SuspensePage>
	);
};

export const MainLayoutElement: FC = () => {
	return (
		<AppProvider>
			<MainLayout />
		</AppProvider>
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

const Systems = lazy(() => import('@/pages/Systems'));

export const SystemsElement: FC = () => {
	return (
		<SuspensePage>
			<Systems />
		</SuspensePage>
	);
};
