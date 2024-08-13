import { Box, Button, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import Toolbar from './Toolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/ReactGridLayout.css';
import GridLayout from 'react-grid-layout';
import { DASHBOARDS_SIDEBAR_WIDTH, NAVBAR_WIDTH } from '@/constants/theme';
// import classes from './styles/tile.module.css';
import classes from './styles/DashboardView.module.css';
import { useDashboardsStore, dashboardsStoreReducers, genLayout, assignOrderToTiles } from './providers/DashboardsProvider';
import _ from 'lodash';
import { IconChartBar } from '@tabler/icons-react';
import { useCallback, useEffect, useRef } from 'react';
import { makeExportClassName } from '@/utils/exportImage';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import Tile from './Tile';
import { Dashboard as DashboardType } from '@/@types/parseable/api/dashboards';
import { useLogsStore } from '../Stream/providers/LogsProvider';

const { toggleCreateDashboardModal, toggleCreateTileModal, toggleDeleteTileModal, resetTilesData } = dashboardsStoreReducers;

const TilesView = (props) => {
	const [activeDashboard, setDashbaordsStore] = useDashboardsStore((store) => store.activeDashboard);
	const [allowDrag] = useDashboardsStore(store => store.allowDrag)
	const [layout] = useDashboardsStore(store => store.layout)
	const hasNoTiles = _.size(activeDashboard?.tiles) < 1;
	const showNoTilesView = hasNoTiles || !activeDashboard
	const [timeRange] = useLogsStore(store => store.timeRange)

	// useEffect(() => {
	// 	if (!showNoTilesView) {
	// 		setDashbaordsStore(resetTilesData);
	// 	}
	// }, [timeRange]);

	if (showNoTilesView) return <NoTilesView />;

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
				onLayoutChange={(layout) => props.onLayoutChang(layout)}>
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

const DeleteTileModal = () => {
	const [activeDashboard, setDashboardsStore] = useDashboardsStore((store) => store.activeDashboard as DashboardType);
	const [deleteTileModalOpen] = useDashboardsStore((store) => store.deleteTileModalOpen);
	const [deleteTileId] = useDashboardsStore((store) => store.deleteTileId);
	const selectedTile = _.find(activeDashboard?.tiles, (tile) => tile.tile_id === deleteTileId);

	const { updateDashboard, isUpdatingDashboard } = useDashboardsQuery();

	const onClose = useCallback(() => {
		setDashboardsStore((store) => toggleDeleteTileModal(store, false, null));
	}, []);

	const onConfirm = useCallback(() => {
		const allTiles = activeDashboard.tiles.filter(tile => tile.tile_id !== selectedTile?.tile_id);
		const tilesWithUpdatedOrder = assignOrderToTiles(allTiles);

		updateDashboard({ dashboard: { ...activeDashboard, tiles: tilesWithUpdatedOrder }, onSuccess: onClose });
	}, [selectedTile?.tile_id, activeDashboard.tiles]);

	if (!activeDashboard?.dashboard_id || !deleteTileId || !selectedTile) return null;

	return (
		<Modal
			opened={deleteTileModalOpen}
			onClose={onClose}
			size="auto"
			centered
			styles={{
				body: { padding: '0 1rem 1rem 1rem', width: 400 },
				header: { padding: '1rem', paddingBottom: '0.4rem' },
			}}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Delete Tile</Text>}>
			<Stack>
				<Stack gap={12}>
					<Text className={classes.deleteWarningText}>
						Are you sure want to delete this tile ?
					</Text>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={onClose} variant="outline">Cancel</Button>
					</Box>
					<Box>
						<Button loading={isUpdatingDashboard} onClick={onConfirm}>Delete</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
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
	const layoutRef = useRef(null);
	if (_.isEmpty(dashboards)) return <NoDashboardsView />;

	const onLayoutChange = useCallback((layout) => {
		const tileIdsWithUpdatedOrder = _.map(layout, (layoutItem) => layoutItem.i);
		layoutRef.current = layout
		console.log(layout, "onchange")
	}, [layoutRef.current])

	return (
		<Stack style={{ flex: 1 }} gap={0}>
			<DeleteTileModal />
			<Toolbar layoutRef={layoutRef}/>
			<TilesView onLayoutChang={onLayoutChange}/>
		</Stack>
	);
};

export default Dashboard;
