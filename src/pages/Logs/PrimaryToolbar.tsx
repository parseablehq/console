import { Stack, px } from '@mantine/core';
import StreamDropdown from '@/components/Header/StreamDropdown';
import IconButton from '@/components/Button/IconButton';
import classes from './styles/Toolbar.module.css';
import { IconBolt, IconExclamationCircle, IconSettings, IconTrash } from '@tabler/icons-react';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import EventTimeLineGraph from './EventTimeLineGraph';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';
import { useCallback } from 'react';

const { toggleLiveTail, toggleAlertsModal, toggleRetentionModal, toggleDeleteModal } = logsStoreReducers;

const renderAlertsIcon = () => <IconExclamationCircle size={px('1.4rem')} stroke={1.5} />;
const renderSettingsIcon = () => <IconSettings size={px('1.4rem')} stroke={1.5} />;
const renderLiveTailIcon = () => <IconBolt size={px('1.4rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash size={px('1.4rem')} stroke={1.5} />;

const PrimaryToolbar = () => {
	const [userAccessMap] = useAppStore((store) => store.userAccessMap);
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	const [maximized] = useAppStore((store) => store.maximized);
	const [showLiveTail, setLogsStore] = useLogsStore((store) => store.liveTailConfig.showLiveTail);

	const onToggleLiveTail = useCallback(() => {
		setLogsStore((store) => toggleLiveTail(store));
	}, []);

	const onToggleAlertsModal = useCallback(() => {
		setLogsStore((store) => toggleAlertsModal(store));
	}, []);

	const onToggleRetentionModal = useCallback(() => {
		setLogsStore((store) => toggleRetentionModal(store));
	}, []);

	const onToggleDeleteModal = useCallback(() => {
		setLogsStore((store) => toggleDeleteModal(store));
	}, []);

	if (maximized) return null;

	return (
		<Stack className={classes.logsPrimaryToolbar} style={{ height: LOGS_PRIMARY_TOOLBAR_HEIGHT }}>
			{/* <StreamDropdown /> */}
			<EventTimeLineGraph />
			{/* <Stack gap={0} style={{ flexDirection: 'row', alignItems: 'center', marginRight: '0.675rem' }}>
				<IconButton
					renderIcon={renderLiveTailIcon}
					onClick={onToggleLiveTail}
					active={showLiveTail}
					tooltipLabel="Live Tail"
				/>
				{userAccessMap.hasUpdateAlertAccess && isStandAloneMode && (
					<IconButton renderIcon={renderAlertsIcon} onClick={onToggleAlertsModal} tooltipLabel="Alerts" />
				)}
				<IconButton renderIcon={renderSettingsIcon} onClick={onToggleRetentionModal} tooltipLabel="Settings" />
				{userAccessMap.hasDeleteAccess && (
					<IconButton renderIcon={renderDeleteIcon} onClick={onToggleDeleteModal} tooltipLabel="Delete" />
				)}
			</Stack> */}
		</Stack>
	);
};

export default PrimaryToolbar;
