import { Box, Button, Divider, FileInput, Modal, Stack, Text, TextInput } from '@mantine/core';
import Toolbar from './Toolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/ReactGridLayout.css';
import GridLayout from 'react-grid-layout';
import { DASHBOARDS_SIDEBAR_WIDTH, NAVBAR_WIDTH } from '@/constants/theme';
import classes from './styles/DashboardView.module.css';
import {
	useDashboardsStore,
	dashboardsStoreReducers,
	assignOrderToTiles,
	TILES_PER_PAGE,
} from './providers/DashboardsProvider';
import _ from 'lodash';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { makeExportClassName } from '@/utils/exportImage';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import Tile from './Tile';
import { Layout } from 'react-grid-layout';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { EditTileType, ImportDashboardType, Tile as TileType } from '@/@types/parseable/api/dashboards';
import { templates } from './assets/templates';
import DeleteOrResetModal from '@/components/Misc/DeleteOrResetModal';

const {
	toggleCreateDashboardModal,
	toggleCreateTileModal,
	toggleDuplicateTileModal,
	toggleDeleteTileModal,
	handlePaging,
	toggleImportDashboardModal,
} = dashboardsStoreReducers;

const TilesView = (props: { onLayoutChange: (layout: Layout[]) => void }) => {
	const [activeDashboard, setDashbaordsStore] = useDashboardsStore((store) => store.activeDashboard);
	const [allowDrag] = useDashboardsStore((store) => store.allowDrag);
	const [layout] = useDashboardsStore((store) => store.layout);
	const [currentPage] = useDashboardsStore((store) => store.currentPage);
	const scrollRef = useRef(null);
	const tilesCount = _.size(activeDashboard?.tiles);
	const hasNoTiles = tilesCount < 1;
	const showNoTilesView = hasNoTiles || !activeDashboard;
	const shouldAppendTileRef = useRef<boolean>(false);

	const handleScroll = useCallback(
		_.throttle(() => {
			const element = scrollRef.current as HTMLElement | null;
			if (element && element.scrollHeight - element.scrollTop === element.clientHeight) {
				if (shouldAppendTileRef.current) {
					return setDashbaordsStore(handlePaging);
				}
			}
		}, 500),
		[],
	);

	useEffect(() => {
		const element = scrollRef.current as HTMLElement | null;
		if (element) {
			element.addEventListener('scroll', handleScroll);
			return () => {
				element.removeEventListener('scroll', handleScroll);
			};
		}
	}, []);

	useEffect(() => {
		shouldAppendTileRef.current = tilesCount > TILES_PER_PAGE * currentPage;
	}, [currentPage, tilesCount]);

	if (showNoTilesView) return <NoTilesView />;

	return (
		<Stack ref={scrollRef} className={classes.tilesViewContainer} style={{ overflowY: 'scroll' }}>
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
		<DeleteOrResetModal
			type="simple"
			isOpen={deleteTileModalOpen}
			onClose={onClose}
			header="Delete Tile"
			content="Are you sure you want to delete this tile?"
			onConfirm={onConfirm}
			isActionInProgress={isUpdatingDashboard}
		/>
	);
};

const DashboardTemplates = (props: {
	onImport: (template: ImportDashboardType) => void;
	isImportingDashboard: boolean;
}) => {
	return (
		<Stack gap={0} mt={6}>
			{_.map(templates, (template) => {
				return (
					<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<Text style={{ fontSize: '0.76rem' }} c="gray.7">
							{template.name}
						</Text>
						<Box>
							<Button
								disabled={props.isImportingDashboard}
								loading={props.isImportingDashboard}
								onClick={() => props.onImport(template)}
								variant="outline">
								Select
							</Button>
						</Box>
					</Stack>
				);
			})}
		</Stack>
	);
};

const ImportDashboardModal = () => {
	const [importDashboardModalOpen, setDashboardStore] = useDashboardsStore((store) => store.importDashboardModalOpen);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	const [file, setFile] = useState<File | null>(null);
	const closeModal = useCallback(() => {
		setDashboardStore((store) => toggleImportDashboardModal(store, false));
	}, []);
	const { importDashboard, isImportingDashboard } = useDashboardsQuery({});
	const makePostCall = useCallback((dashboard: ImportDashboardType) => {
		return importDashboard({
			dashboard,
			onSuccess: () => {
				closeModal();
				setFile(null);
			},
		});
	}, []);

	const onImport = useCallback(() => {
		if (file === null) return;

		if (file) {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				try {
					const target = e.target;
					if (target === null || typeof target.result !== 'string') return;

					const newDashboard: ImportDashboardType = JSON.parse(target.result);
					if (_.isEmpty(newDashboard)) return;

					return makePostCall(newDashboard);
				} catch (error) {
					console.log('error', error);
				}
			};
			reader.readAsText(file);
		} else {
			console.error('No file selected.');
		}
	}, [activeDashboard, file]);

	return (
		<Modal
			opened={importDashboardModalOpen}
			onClose={closeModal}
			size="auto"
			centered
			styles={{
				body: { padding: '0 1rem 1rem 1rem', width: 400 },
				header: { padding: '1rem', paddingBottom: '0.4rem' },
			}}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Import Dashboard</Text>}>
			<Stack gap={24}>
				{!isStandAloneMode && (
					<>
						<DashboardTemplates onImport={makePostCall} isImportingDashboard={isImportingDashboard} />
						<Divider label="OR" />
					</>
				)}
				<FileInput
					style={{ marginTop: '0.25rem' }}
					label=""
					placeholder="Import dashboard config downloaded from Parseable"
					fileInputProps={{ accept: '.json' }}
					value={file}
					onChange={setFile}
				/>
				<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={closeModal} variant="outline">
							Cancel
						</Button>
					</Box>
					<Box>
						<Button disabled={file === null || isImportingDashboard} onClick={onImport} loading={isImportingDashboard}>
							Import
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

	const openImportDashboardModal = useCallback(() => {
		setDashboardsStore((store) => toggleImportDashboardModal(store, true));
	}, []);

	return (
		<Stack className={classes.noDashboardsContainer} gap={4}>
			<ImportDashboardModal />
			<Stack className={classes.dashboardIconContainer}>
				<IconLayoutDashboard className={classes.dashboardIcon} stroke={1.2} />
			</Stack>
			<Text className={classes.noDashboardsViewTitle}>Create dashboard</Text>
			<Text className={classes.noDashboardsViewDescription}>
				Create your first dashboard to visualize log events from various streams.
			</Text>
			<Stack gap={14} mt={4}>
				<Box>
					<Button variant="outline" onClick={openImportDashboardModal}>
						Import Dashboard
					</Button>
				</Box>
				<Box>
					<Button onClick={openCreateDashboardModal}>Create Dashboard</Button>
				</Box>
			</Stack>
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

const InvalidDashboardView = () => {
	return (
		<Stack className={classes.noDashboardsContainer} gap={4}>
			<Stack className={classes.dashboardIconContainer}>
				<IconLayoutDashboard className={classes.dashboardIcon} stroke={1.2} />
			</Stack>
			<Text className={classes.noDashboardsViewTitle}>Oops! Dashboard Not Found</Text>
			<Text className={classes.noDashboardsViewDescription}>
				It looks like the dashboard you’re looking for doesn’t exist. Please check the link or try a different one!
			</Text>
		</Stack>
	);
};

const findTileByTileId = (tiles: TileType[], tileId: string | null) => {
	return _.find(tiles, (tile) => tile.tile_id === tileId);
};

const DuplicateTileModal = () => {
	const [duplicateTileModalOpen, setDashboardsStore] = useDashboardsStore((store) => store.duplicateTileModalOpen);
	const [editTileId] = useDashboardsStore((store) => store.editTileId);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const [inputValue, setInputValue] = useState<string>('');
	const onClose = useCallback(() => {
		setDashboardsStore((store) => toggleDuplicateTileModal(store, false, null));
	}, []);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	}, []);
	const { updateDashboard, isUpdatingDashboard } = useDashboardsQuery({});

	const handleSubmit = useCallback(() => {
		const currentTile = findTileByTileId(activeDashboard?.tiles || [], editTileId);
		if (currentTile && activeDashboard) {
			const currentOrder = currentTile.order;
			const tempTiles = [...activeDashboard.tiles] as EditTileType[];
			const duplicatedTile = _.omit({ ...currentTile, name: inputValue }, 'tile_id');
			tempTiles.splice(currentOrder, 0, duplicatedTile);
			const updatedTilesWithOrder = assignOrderToTiles(tempTiles);
			return updateDashboard({
				dashboard: { ...activeDashboard, tiles: updatedTilesWithOrder },
				onSuccess: () => {
					onClose();
				},
			});
		}
	}, [inputValue, editTileId, activeDashboard]);

	useEffect(() => {
		const currentTile = findTileByTileId(activeDashboard?.tiles || [], editTileId);
		if (currentTile) {
			setInputValue(currentTile?.name);
		}
	}, [editTileId]);

	return (
		<Modal
			opened={duplicateTileModalOpen}
			onClose={onClose}
			size="auto"
			centered
			styles={{
				body: { padding: '0 1rem 1rem 1rem', width: 400 },
				header: { padding: '1rem', paddingBottom: '0.4rem' },
			}}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Duplicate Tile</Text>}>
			<Stack>
				<Stack gap={12}>
					<TextInput value={inputValue} onChange={handleInputChange} />
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={onClose} variant="outline">
							Cancel
						</Button>
					</Box>
					<Box>
						<Button onClick={handleSubmit} loading={isUpdatingDashboard} disabled={_.isEmpty(inputValue)}>
							Done
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

const Dashboard = () => {
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
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
			<DuplicateTileModal />
			<Toolbar layoutRef={layoutRef} />
			<ImportDashboardModal />
			{activeDashboard ? <TilesView onLayoutChange={onLayoutChange} /> : <InvalidDashboardView />}
		</Stack>
	);
};

export default Dashboard;
