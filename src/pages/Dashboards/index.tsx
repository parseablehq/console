import { Box, Loader, Stack } from '@mantine/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import SideBar from './SideBar';
import Dashboard from './Dashboard';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import CreateDashboardModal from './CreateDashboardModal';
import { useEffect, useState } from 'react';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import CreateTileForm from './CreateTileForm';
import { useSyncTimeRange } from './hooks';
import { getAllParams } from '@/url-sync/syncStore';
// import { useListenToStore } from '@/url-sync/useListentoStore';

const { selectDashboard } = dashboardsStoreReducers;

const LoadingView = () => {
	return (
		<Stack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Loader />
		</Stack>
	);
};

const Dashboards = () => {
	const [isStoreSynced, setIsStoreSynced] = useState<boolean>(false);
	const [dashboards, setDashbaordsStore] = useDashboardsStore((store) => store.dashboards);
	const [createTileFormOpen] = useDashboardsStore((store) => store.createTileFormOpen);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const { updateTimeRange } = useSyncTimeRange();
	const { fetchDashboards } = useDashboardsQuery({ updateTimeRange });
	const [dashStore] = useDashboardsStore((store) => store);

	useEffect(() => {
		fetchDashboards();
	}, []);

	useEffect(() => {
		if (!dashboards && !window.location.search) return;
		const { id } = getAllParams();
		setDashbaordsStore((store) => selectDashboard(store, id));
	}, [dashboards]);

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
			{dashboards === null && !isStoreSynced ? (
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
