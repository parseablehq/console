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
import StreamDropdown from '@/components/Header/StreamDropdown';
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import StreamingButton from '@/components/Header/StreamingButton';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';

const {toggleDeleteModal} = logsStoreReducers;
const renderMaximizeIcon = () => <IconMaximize size={px('1.4rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash size={px('1.4rem')} stroke={1.5} />;

const MaximizeButton = () => {
	const [_appStore, setAppStore] = useAppStore((_store) => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderMaximizeIcon} onClick={onClick} tooltipLabel="Full Screen" />;
};

const DeleteStreamButton = () => {
	const [_appStore, setLogsStore] = useLogsStore((_store) => null);
	const onClick = useCallback(() => setLogsStore(toggleDeleteModal), []);
	return <IconButton renderIcon={renderDeleteIcon} onClick={onClick} tooltipLabel="Delete" />;
};

const ExploreToolbar = () => (
	<>
		<StreamDropdown />
		<Querier />
		<TimeRange />
		<RefreshInterval />
		<MaximizeButton />
		<RefreshNow />
	</>
);

const LiveTailToolbar = () => (
	<>
		<StreamDropdown />
		<StreamingButton />
		<MaximizeButton />
	</>
);

const ManagementToolbar = () => (
	<>
		<StreamDropdown />
		<DeleteStreamButton />
	</>
);

const PrimaryToolbar = () => {
	const [maximized] = useAppStore((store) => store.maximized);
	const { view } = useParams();

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
			{view === 'explore' ? (
				<ExploreToolbar />
			) : view === 'live-tail' ? (
				<LiveTailToolbar />
			) : view === 'manage' ? (
				<ManagementToolbar />
			) : null}
		</Stack>
	);
};

export default PrimaryToolbar;
