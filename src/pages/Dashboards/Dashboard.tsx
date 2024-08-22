import { Box, Button, Modal, Stack, Text } from '@mantine/core';
import Toolbar from './Toolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/ReactGridLayout.css';
import GridLayout from 'react-grid-layout';
import { DASHBOARDS_SIDEBAR_WIDTH, NAVBAR_WIDTH } from '@/constants/theme';
import classes from './styles/DashboardView.module.css';
import { useDashboardsStore, dashboardsStoreReducers, assignOrderToTiles } from './providers/DashboardsProvider';
import _ from 'lodash';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useCallback, useRef } from 'react';
import { makeExportClassName } from '@/utils/exportImage';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import Tile from './Tile';
import { Layout } from 'react-grid-layout';

const { toggleCreateDashboardModal, toggleCreateTileModal, toggleDeleteTileModal } = dashboardsStoreReducers;

const TilesView = (props: { onLayoutChange: (layout: Layout[]) => void }) => {
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const [allowDrag] = useDashboardsStore((store) => store.allowDrag);
	const [layout] = useDashboardsStore((store) => store.layout);
	const hasNoTiles = _.size(activeDashboard?.tiles) < 1;
	const showNoTilesView = hasNoTiles || !activeDashboard;
	if (showNoTilesView) return <NoTilesView />;

	return (
		<Stack className={classes.tilesViewConatiner} style={{ overflowY: 'scroll' }}>
			<GridLayout
				className="layout"
				layout={layout}
				cols={12}
				rowHeight={300}
				width={window.innerWidth - NAVBAR_WIDTH - DASHBOARDS_SIDEBAR_WIDTH}
				isResizable={false}
				margin={[16, 16]}
				containerPadding={[16, 16]}
				compactType="horizontal"
				isDraggable={allowDrag}
				onLayoutChange={(layout) => props.onLayoutChange(layout)}>
				{_.map(layout, (item) => {
					return (
						<div
							key={item.i}
							style={{
								transition: 'none',
								background: 'white',
							}}
							className={`${classes.container} ${makeExportClassName(item.i)}`}>
							<Tile id={item.i} />
						</div>
					);
				})}
			</GridLayout>
		</Stack>
	);
};

const DeleteTileModal = () => {
	const [activeDashboard, setDashboardsStore] = useDashboardsStore((store) => store.activeDashboard);
	const [deleteTileModalOpen] = useDashboardsStore((store) => store.deleteTileModalOpen);
	const [deleteTileId] = useDashboardsStore((store) => store.deleteTileId);
	const selectedTile = _.find(activeDashboard?.tiles, (tile) => tile.tile_id === deleteTileId);

	const { updateDashboard, isUpdatingDashboard } = useDashboardsQuery({});

	const onClose = useCallback(() => {
		setDashboardsStore((store) => toggleDeleteTileModal(store, false, null));
	}, []);

	const onConfirm = useCallback(() => {
		const remainingTiles = activeDashboard?.tiles.filter((tile) => tile.tile_id !== selectedTile?.tile_id);
		if (_.isUndefined(remainingTiles) || !activeDashboard) return;

		const tilesWithUpdatedOrder = assignOrderToTiles(remainingTiles);
		updateDashboard({ dashboard: { ...activeDashboard, tiles: tilesWithUpdatedOrder }, onSuccess: onClose });
	}, [selectedTile?.tile_id, activeDashboard?.tiles]);

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
					<Text className={classes.deleteWarningText}>Are you sure want to delete this tile ?</Text>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={onClose} variant="outline">
							Cancel
						</Button>
					</Box>
					<Box>
						<Button loading={isUpdatingDashboard} onClick={onConfirm}>
							Delete
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

const NoDashboardsView = () => {
	const [, setDashboardsStore] = useDashboardsStore((_store) => null);

	const openCreateDashboardModal = useCallback(() => {
		setDashboardsStore((store) => toggleCreateDashboardModal(store, true));
	}, []);

	return (
		<Stack className={classes.noDashboardsContainer} gap={4}>
			<Stack className={classes.dashboardIconContainer}>
				<IconLayoutDashboard className={classes.dashboardIcon} stroke={1.2} />
			</Stack>
			<Text className={classes.noDashboardsViewTitle}>Create dashboard</Text>
			<Text className={classes.noDashboardsViewDescription}>
				Create your first dashboard to visualize log events from various streams.
			</Text>
			<Box mt={4}>
				<Button onClick={openCreateDashboardModal}>Create Dashboard</Button>
			</Box>
		</Stack>
	);
};

const NoTilesView = () => {
	const [, setDashbaordsStore] = useDashboardsStore((_store) => null);

	const openCreateTileModal = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateTileModal(store, true));
	}, []);

	return (
		<Stack className={classes.noDashboardsContainer} gap={4}>
			<Stack className={classes.dashboardIconContainer}>
				<IconLayoutDashboard className={classes.dashboardIcon} stroke={1.2} />
			</Stack>
			<Text className={classes.noDashboardsViewTitle}>Add tiles to the dashboard</Text>
			<Text className={classes.noDashboardsViewDescription}>
				A tile is single unit of visualization. It is a visualization window based on a SQL query. A dashboard is made
				up of tiles. Create your first tile for this dashboard.
			</Text>
			<Box mt={4}>
				<Button onClick={openCreateTileModal}>Add Tile</Button>
			</Box>
		</Stack>
	);
};

const Dashboard = () => {
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	const layoutRef = useRef<Layout[]>([]);
	const onLayoutChange = useCallback(
		(layout: Layout[]) => {
			layoutRef.current = layout;
		},
		[layoutRef.current],
	);
	if (_.isEmpty(dashboards)) return <NoDashboardsView />;

	return (
		<Stack style={{ flex: 1 }} gap={0}>
			<DeleteTileModal />
			<Toolbar layoutRef={layoutRef} />
			<TilesView onLayoutChange={onLayoutChange} />
		</Stack>
	);
};

export default Dashboard;
