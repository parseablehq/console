import { Stack, px } from '@mantine/core';
import IconButton from '@/components/Button/IconButton';
import { IconListSearch, IconMaximize, IconTrash } from '@tabler/icons-react';
import { STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT, STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';
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
import { filterStoreReducers, useFilterStore } from '../providers/FilterProvider';

const { toggleDeleteModal } = logsStoreReducers;
const { toggleSavedFiltersModal } = filterStoreReducers;
const renderMaximizeIcon = () => <IconMaximize size={px('1rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash size={px('1rem')} stroke={1.5} />;
const renderSavedFiltersIcon = () => <IconListSearch size={px('1rem')} stroke={1.5} />;

const MaximizeButton = () => {
	const [_appStore, setAppStore] = useAppStore((_store) => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderMaximizeIcon} size={38} onClick={onClick} tooltipLabel="Full Screen" />;
};

const SavedFiltersButton = () => {
	const [_store, setLogsStore] = useFilterStore((_store) => null);
	const onClick = useCallback(() => setLogsStore((store) => toggleSavedFiltersModal(store, true)), []);
	return <IconButton renderIcon={renderSavedFiltersIcon} size={38} onClick={onClick} tooltipLabel="Saved Filters" />;
};

const DeleteStreamButton = () => {
	const [_store, setLogsStore] = useLogsStore((_store) => null);
	const onClick = useCallback(() => setLogsStore(toggleDeleteModal), []);
	return <IconButton renderIcon={renderDeleteIcon} size={38} onClick={onClick} tooltipLabel="Delete" />;
};

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
					<SavedFiltersButton/>
					<TimeRange />
					<RefreshInterval />
					<MaximizeButton />
					<RefreshNow />
				</Stack>
			) : view === 'live-tail' ? (
				<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
					<StreamDropdown />
					<StreamingButton />
					<MaximizeButton />
				</Stack>
			) 
			: view === 'manage' ? (
				<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
					<StreamDropdown />
					<DeleteStreamButton />
				</Stack>
			)
			 : null}
		</Stack>
	);
};

export default PrimaryToolbar;
