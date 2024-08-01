import { Box, Button, Stack, Text, ThemeIcon } from '@mantine/core';
import Toolbar from './Toolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/ReactGridLayout.css';
import GridLayout from 'react-grid-layout';
import { DASHBOARDS_SIDEBAR_WIDTH, NAVBAR_WIDTH } from '@/constants/theme';
import Tile from './Tile';
// import classes from './styles/tile.module.css';
import classes from './styles/Dashboard.module.css';
import { useDashboardsStore, dashboardsStoreReducers, genLayout } from './providers/DashboardsProvider';
import _ from 'lodash';
import { IconChartBar } from '@tabler/icons-react';
import { useCallback } from 'react';
import { makeExportClassName } from '@/utils/exportImage';

const { toggleCreateDashboardModal, toggleCreateTileModal } = dashboardsStoreReducers;

const TilesView = () => {
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const [allowDrag] = useDashboardsStore(store => store.allowDrag)
	const hasNoTiles = _.size(activeDashboard?.tiles) < 1;

	if (hasNoTiles || !activeDashboard) return <NoTilesView />;

	const { tiles } = activeDashboard;

	// debug - memo
	const layout = genLayout(tiles);
	console.log(layout, "given layout")
	return (
		<Stack className={classes.tilesViewConatiner}>
			<GridLayout
				className="layout"
				layout={layout}
				cols={12}
				rowHeight={300}
				width={window.innerWidth - NAVBAR_WIDTH - DASHBOARDS_SIDEBAR_WIDTH}
				isResizable={false}
				margin={[16, 16]}
				containerPadding={[20, 10]}
				compactType="horizontal"
				isDraggable={allowDrag}
				onLayoutChange={(layout) => console.log(layout, "made layout")}
				>
				{_.map(layout, (item) => {
					return (
						<div
							key={item.i}
							style={{ transition: 'none', background: 'white' }}
							className={`${classes.container} ${makeExportClassName(item.i)}`}>
							<Tile id={item.i} />
						</div>
					);
				})}

				{/* <div key="b" style={{ border: '1px solid black', transition: 'none', backgroundColor: 'lightblue' }}>
					Item B
				</div>
				<div key="c" style={{ border: '1px solid black', transition: 'none', backgroundColor: 'lightgreen' }}>
					Item C
				</div>
				<div key="d" style={{ border: '1px solid black', transition: 'none', backgroundColor: 'lightcoral' }}>
					Item D
				</div> */}
			</GridLayout>
		</Stack>
	);
};

const NoDashboardsView = () => {
	const [, setDashbaordsStore] = useDashboardsStore((store) => null);

	const openCreateDashboardModal = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateDashboardModal(store, true));
	}, []);

	return (
		<Stack className={classes.noDashboardsContainer}>
			{/* <ThemeIcon size="lg" variant='light' radius="lg"> */}
			<Stack className={classes.dashboardIconContainer}>
				<IconChartBar className={classes.dashboardIcon} stroke={1.2} />
			</Stack>
			<Text className={classes.noDashboardsViewTitle}>Create Dashboard Title Placeholder</Text>
			<Text className={classes.noDashboardsViewDescription}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
				magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			</Text>
			<Box>
				<Button onClick={openCreateDashboardModal}>Create Dashboard</Button>
			</Box>
			{/* </ThemeIcon> */}
		</Stack>
	);
};

const NoTilesView = () => {
	const [, setDashbaordsStore] = useDashboardsStore((store) => null);

	const openCreateTileModal = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateTileModal(store, true));
	}, []);

	return (
		<Stack className={classes.noDashboardsContainer} gap={4}>
			<Stack className={classes.dashboardIconContainer}>
				<IconChartBar className={classes.dashboardIcon} stroke={1.2} />
			</Stack>
			<Text className={classes.noDashboardsViewTitle}>Create Tile Title Placeholder</Text>
			<Text className={classes.noDashboardsViewDescription}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
				magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			</Text>
			<Box mt={4}>
				<Button onClick={openCreateTileModal}>Add Tile</Button>
			</Box>
		</Stack>
	);
};

const Dashboard = () => {
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	if (_.isEmpty(dashboards)) return <NoDashboardsView />;

	return (
		<Stack style={{ flex: 1 }} gap={0}>
			<Toolbar />
			<TilesView />
		</Stack>
	);
};

export default Dashboard;
