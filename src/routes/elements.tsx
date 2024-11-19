import Home from '@/pages/Home';
import type { FC } from 'react';
import { lazy } from 'react';
import SuspensePage from './SuspensePage';
import MainLayout from '@/layouts/MainLayout';
import { AppProvider } from '@/layouts/MainLayout/providers/AppProvider';
import { LogsProvider } from '@/pages/Stream/providers/LogsProvider';
import { FilterProvider } from '@/pages/Stream/providers/FilterProvider';
import { StreamProvider } from '@/pages/Stream/providers/StreamProvider';
import { ClusterProvider } from '@/pages/Systems/providers/ClusterProvider';
import { CorrelationProvider } from '@/pages/Correlation/providers/CorrelationProvider';
import { DashbaordsProvider } from '@/pages/Dashboards/providers/DashboardsProvider';
import Dashboards from '@/pages/Dashboards';

export const HomeElement: FC = () => {
	return (
		<SuspensePage>
			<Home />
		</SuspensePage>
	);
};

export const DashboardsElement: FC = () => {
	return (
		<SuspensePage>
			<LogsProvider>
				<DashbaordsProvider>
					<Dashboards />
				</DashbaordsProvider>
			</LogsProvider>
		</SuspensePage>
	);
};

const Correlation = lazy(() => import('@/pages/Correlation'));
export const CorrelationElement: FC = () => {
	return (
		<SuspensePage>
			<StreamProvider>
				<LogsProvider>
					<FilterProvider>
						<CorrelationProvider>
							<Correlation />
						</CorrelationProvider>
					</FilterProvider>
				</LogsProvider>
			</StreamProvider>
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

const Stream = lazy(() => import('@/pages/Stream'));

export const StreamElement: FC = () => {
	return (
		<SuspensePage>
			<StreamProvider>
				<LogsProvider>
					<FilterProvider>
						<Stream />
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
			<ClusterProvider>
				<Systems />
			</ClusterProvider>
		</SuspensePage>
	);
};
