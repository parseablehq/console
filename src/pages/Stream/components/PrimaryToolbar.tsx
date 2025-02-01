import { Button, Stack, px, rem } from '@mantine/core';
import { IconFilterHeart, IconMaximize, IconTable, IconTrash } from '@tabler/icons-react';
import { STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT, STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { filterStoreReducers, useFilterStore } from '../providers/FilterProvider';
import { logsStoreReducers, useLogsStore } from '../providers/LogsProvider';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import IconButton from '@/components/Button/IconButton';
import Querier from './Querier';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';
import StreamDropdown from '@/components/Header/StreamDropdown';
import StreamingButton from '@/components/Header/StreamingButton';
import TimeRange from '@/components/Header/TimeRange';
import _ from 'lodash';
import classes from './styles/PrimaryToolbar.module.css';
import { notifications } from '@mantine/notifications';

const { toggleDeleteModal, onToggleView } = logsStoreReducers;
const { toggleSavedFiltersModal } = filterStoreReducers;
const renderMaximizeIcon = () => <IconMaximize color="#495057" size={px('1rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash data-id="delete-stream-btn" size={px('1rem')} stroke={1.5} />;

export const MaximizeButton = () => {
	const [, setAppStore] = useAppStore(() => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderMaximizeIcon} size={38} onClick={onClick} tooltipLabel="Full screen" />;
};

const SavedFiltersButton = () => {
	const [, setLogsStore] = useFilterStore(() => null);
	const onClick = useCallback(() => setLogsStore((store) => toggleSavedFiltersModal(store, true)), []);
	return (
		<Button
			className={classes.savedFiltersBtn}
			h="100%"
			leftSection={<IconFilterHeart size={px('1rem')} stroke={1.5} />}
			onClick={onClick}>
			Saved Filters
		</Button>
	);
};

const DeleteStreamButton = () => {
	const [, setLogsStore] = useLogsStore(() => null);
	const onClick = useCallback(() => setLogsStore(toggleDeleteModal), []);
	return <IconButton renderIcon={renderDeleteIcon} size={38} onClick={onClick} tooltipLabel="Delete" />;
};

const ViewToggle = () => {
	const [viewMode, setLogsStore] = useLogsStore((store) => store.viewMode);
	const iconProps = {
		style: { width: rem(20), height: rem(20), display: 'block' },
		stroke: 1.8,
	};
	const onToggle = useCallback(() => {
		setLogsStore((store) => onToggleView(store, viewMode === 'table' ? 'json' : 'table'));
	}, [viewMode]);

	const isActive = viewMode === 'table';
	return (
		<Button
			className={classes.savedFiltersBtn}
			h="100%"
			style={{
				backgroundColor: isActive ? '#535BEB' : 'white',
				color: isActive ? 'white' : '#495057',
			}}
			onClick={onToggle}
			leftSection={<IconTable {...iconProps} />}>
			Table View
		</Button>
	);
};

const PrimaryToolbar = () => {
	const [maximized] = useAppStore((store) => store.maximized);
	const [hasDeleteStreamAccess] = useAppStore((store) => store.userAccessMap.hasDeleteStreamAccess);
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
		<Stack
			style={{
				height: STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
				alignItems: 'center',
				justifyContent: 'center',
				padding: '0 1.25rem',
			}}>
			{view === 'explore' ? (
				<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
					<StreamDropdown />
					<Querier />
					<SavedFiltersButton />
					<TimeRange />
					<RefreshInterval />
					<RefreshNow />
					<ViewToggle />
					<ShareButton />
					<MaximizeButton />
				</Stack>
			) : view === 'live-tail' ? (
				<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
					<StreamDropdown />
					<StreamingButton />
					<MaximizeButton />
				</Stack>
			) : view === 'manage' ? (
				<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
					<StreamDropdown />
					{hasDeleteStreamAccess && <DeleteStreamButton />}
				</Stack>
			) : null}
		</Stack>
	);
};

export default PrimaryToolbar;
