import { DASHBOARDS_SIDEBAR_WIDTH } from '@/constants/theme';
import { Box, Button, Divider, FileInput, Modal, px, ScrollArea, Stack, Text } from '@mantine/core';
import classes from './styles/sidebar.module.css';
import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useState } from 'react';
import _ from 'lodash';
import { Dashboard, ImportDashboardType } from '@/@types/parseable/api/dashboards';
import IconButton from '@/components/Button/IconButton';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import { templates } from './assets/templates';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

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

const DashboardTemplates = (props: {onImport: (template: ImportDashboardType) => void; isImportingDashboard: boolean}) => {
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
}

const ImportDashboardModal = () => {
	const [importDashboardModalOpen, setDashboardStore] = useDashboardsStore((store) => store.importDashboardModalOpen);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const [isStandAloneMode] = useAppStore(store => store.isStandAloneMode)
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
		if (activeDashboard === null || file === null) return;

		if (file) {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				try {
					const target = e.target;
					if (target === null || typeof target.result !== 'string') return;

					const newDashboard: ImportDashboardType = JSON.parse(target.result);
					if (_.isEmpty(newDashboard)) return;

					return makePostCall(newDashboard)
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
