import { Stack, px } from '@mantine/core';
import IconButton from '@/components/Button/IconButton';
import classes from '../styles/Toolbar.module.css';
import { IconMaximize, IconTrash } from '@tabler/icons-react';
import { STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import Querier from './Querier';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCallback, useEffect } from 'react';
import { useLogsStore } from '../providers/LogsProvider';
import StreamDropdown from '@/components/Header/StreamDropdown';
import { notifications } from '@mantine/notifications';

const renderMaximizeIcon = () => <IconMaximize size={px('1.4rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash size={px('1.4rem')} stroke={1.5} />;

const MaximizeButton = () => {
	const [_appStore, setAppStore] = useAppStore((_store) => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderMaximizeIcon} onClick={onClick} tooltipLabel="Full Screen" />;
};

const DeleteStreamButton = () => {
	const [_appStore, setAppStore] = useAppStore((_store) => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderDeleteIcon} onClick={onClick} tooltipLabel="Delete" />;
};

const PrimaryToolbar = () => {
	const [maximized] = useAppStore((store) => store.maximized);
	const [currentView] = useLogsStore((store) => store.currentView);

	useEffect(() => {
		if (maximized) {
			notifications.show({
				message: 'Press Esc to exit full screen',
				withBorder: true,
				autoClose: 2000,
			});
		}
	}, [maximized]);

	return (
		<Stack className={classes.logsSecondaryToolbar} gap="0.675rem" style={{ height: STREAM_PRIMARY_TOOLBAR_HEIGHT }}>
			<StreamDropdown />
			{currentView === 'manage' ? (
				<DeleteStreamButton />
			) : (
				<>
					<Querier />
					<TimeRange />
					<RefreshInterval />
					<MaximizeButton />
					<RefreshNow />
				</>
			)}
		</Stack>
	);
};

export default PrimaryToolbar;
