import { Box, Loader, Stack } from '@mantine/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import SideBar from './SideBar';
import Dashboard from './Dashboard';
import { useDashboardsStore } from './providers/DashboardsProvider';
import CreateDashboardModal from './CreateDashboardModal';
import { useEffect } from 'react';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import CreateTileForm from './CreateTileForm';
import { useSyncTimeRange } from './hooks';
import _ from 'lodash';
import useParamsController from './hooks/useParamsController';
import { useDocumentTitle } from '@mantine/hooks';

const LoadingView = () => {
	return (
		<Stack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Loader />
		</Stack>
	);
};

const Dashboards = () => {
	useDocumentTitle('Parseable | Dashboards');
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	const [createTileFormOpen] = useDashboardsStore((store) => store.createTileFormOpen);
	const { isStoreSynced } = useParamsController();
	const { updateTimeRange } = useSyncTimeRange();
	const { fetchDashboards } = useDashboardsQuery({ updateTimeRange });
	useEffect(() => {
		if (isStoreSynced) {
			fetchDashboards();
		}
	}, [isStoreSynced]);

	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				flexDirection: 'row',
				width: '100%',
				overflow: 'hidden',
			}}>
			{dashboards === null || !isStoreSynced ? (
				<LoadingView />
			) : createTileFormOpen ? (
				<CreateTileForm />
			) : (
				<>
					<SideBar updateTimeRange={updateTimeRange} />
					<CreateDashboardModal />
					<Dashboard />
				</>
			)}
		</Box>
	);
};

export default Dashboards;
