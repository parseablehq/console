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
import { syncDashboardStoretoURL, useSyncTimeRange } from './hooks';
import { getAllParams } from '@/url-sync/syncStore';
import { useLocation } from 'react-router-dom';
import NotFound from '../Errors/NotFound';

const { selectDashboard } = dashboardsStoreReducers;

const LoadingView = () => {
	return (
		<Stack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Loader />
		</Stack>
	);
};

const Dashboards = () => {
	const [isValidDashboardID, setIsValidDashboardID] = useState(true);
	const [dashboards, setDashbaordsStore] = useDashboardsStore((store) => store.dashboards);
	const [createTileFormOpen] = useDashboardsStore((store) => store.createTileFormOpen);
	const { updateTimeRange } = useSyncTimeRange();
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const { fetchDashboards } = useDashboardsQuery({ updateTimeRange });
	const { updateURL } = syncDashboardStoretoURL();

	const location = useLocation();

	useEffect(() => {
		fetchDashboards();
	}, []);

	useEffect(() => {
		if (!location.search) {
			if (activeDashboard) updateURL(activeDashboard?.dashboard_id);
			return;
		}
		const { id } = getAllParams();
		if (dashboards) {
			const isValidID = dashboards.find((dashboard) => dashboard.dashboard_id === id);
			if (isValidID === undefined) {
				setIsValidDashboardID(false);
				return;
			}
		}
		setDashbaordsStore((store) => selectDashboard(store, id));
	}, [location.search, dashboards, updateURL]);

	if (dashboards && !isValidDashboardID) return <NotFound />;

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
			{dashboards === null ? (
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
