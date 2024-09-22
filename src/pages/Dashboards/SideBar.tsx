import { DASHBOARDS_SIDEBAR_WIDTH } from '@/constants/theme';
import { Box, Button, FileInput, Modal, px, ScrollArea, Stack, Text } from '@mantine/core';
import classes from './styles/sidebar.module.css';
import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useState } from 'react';
import _ from 'lodash';
import { Dashboard } from '@/@types/parseable/api/dashboards';
import IconButton from '@/components/Button/IconButton';
import { useDashboardsQuery } from '@/hooks/useDashboards';

const { selectDashboard, toggleCreateDashboardModal, toggleImportDashboardModal } =
	dashboardsStoreReducers;
interface DashboardItemProps extends Dashboard {
	activeDashboardId: undefined | string;
	onSelect: (id: string) => void;
}

const DashboardListItem = (props: DashboardItemProps) => {
	const { name, dashboard_id, tiles, activeDashboardId, onSelect } = props;
	const totalTiles = _.size(tiles);
	const isActive = dashboard_id === activeDashboardId;

	const selectDashboard = useCallback(() => {
		!isActive && onSelect(dashboard_id);
	}, [isActive]);
	return (
		<Stack gap={0} className={`${classes.dashboardItem} ${isActive ? classes.active : ''}`} onClick={selectDashboard}>
			<Text className={classes.dashboardTitle} lineClamp={1}>
				{name}
			</Text>
			<Text className={classes.tilesCountText}>{`${totalTiles} Tile${totalTiles === 1 ? '' : 's'}`}</Text>
		</Stack>
	);
};

const DashboardList = (props: { updateTimeRange: (dashboard: Dashboard) => void }) => {
	const [dashboards, setDashbaordsStore] = useDashboardsStore((store) => store.dashboards);
	const [activeDashboardId] = useDashboardsStore((store) => store.activeDashboard?.dashboard_id);

	const onSelectDashboardId = useCallback(
		(dashboardId: string) => {
			if (activeDashboardId === dashboardId) return;

			const dashboard = _.find(dashboards, (dashboard) => dashboard.dashboard_id === dashboardId);
			dashboard && props.updateTimeRange(dashboard);
			setDashbaordsStore((store) => selectDashboard(store, dashboardId));
		},
		[activeDashboardId, dashboards],
	);

	return (
		<ScrollArea scrollbars="y">
			<Stack style={{ marginBottom: '1rem' }}>
				{_.map(dashboards, (dashboard) => {
					return (
						<DashboardListItem
							key={dashboard.dashboard_id}
							{...dashboard}
							activeDashboardId={activeDashboardId}
							onSelect={onSelectDashboardId}
						/>
					);
				})}
			</Stack>
		</ScrollArea>
	);
};

const ImportDashboardModal = () => {
	const [importDashboardModalOpen, setDashboardStore] = useDashboardsStore((store) => store.importDashboardModalOpen);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const [file, setFile] = useState<File | null>(null);
	const closeModal = useCallback(() => {
		setDashboardStore((store) => toggleImportDashboardModal(store, false));
	}, []);
	const { createDashboard, isCreatingDashboard } = useDashboardsQuery({});
	const onImport = useCallback(() => {
		if (activeDashboard === null || file === null) return;

		if (file) {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				try {
					const target = e.target;
					if (target === null || typeof target.result !== 'string') return;

					const newDashboard = JSON.parse(target.result);
					if (_.isEmpty(newDashboard)) return;

					return createDashboard({
						dashboard: newDashboard,
						onSuccess: () => {
							closeModal();
							setFile(null);
						},
					});
				} catch (error) {}
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
				<FileInput
					style={{ marginTop: '0.25rem' }}
					label=""
					placeholder="Import Parseable dashboard config json"
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
						<Button disabled={file === null} onClick={onImport} loading={isCreatingDashboard}>
							Import
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

const renderShareIcon = () => <IconFileDownload size={px('1rem')} stroke={1.5} />;

const ImportDashboardButton = () => {
	const [_store, setDashbaordsStore] = useDashboardsStore((_store) => null);
	const onClick = useCallback(() => {
		setDashbaordsStore((store) => toggleImportDashboardModal(store, true));
	}, []);
	return <IconButton renderIcon={renderShareIcon} size={36} onClick={onClick} tooltipLabel="Import Dashboard" />;
};

const SideBar = (props: { updateTimeRange: (dashboard: Dashboard) => void }) => {
	const [dashboards, setDashbaordsStore] = useDashboardsStore((store) => store.dashboards);

	const openCreateStreamModal = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateDashboardModal(store, true));
	}, []);

	if (_.isEmpty(dashboards)) return null;

	return (
		<Stack style={{ width: DASHBOARDS_SIDEBAR_WIDTH }} className={classes.container}>
			<ImportDashboardModal />
			<Stack style={{ padding: '0.75rem', paddingBottom: 0, justifyContent: 'center', flexDirection: 'row' }}>
				<Button
					variant="outline"
					className={classes.createDashboardBtn}
					onClick={openCreateStreamModal}
					leftSection={<IconPlus stroke={2} size={'1rem'} />}>
					New Dashboard
				</Button>
				<ImportDashboardButton />
			</Stack>
			<DashboardList updateTimeRange={props.updateTimeRange} />
		</Stack>
	);
};

export default SideBar;
