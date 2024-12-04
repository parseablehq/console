import { Button, SegmentedControl, Stack, Tooltip, px, rem } from '@mantine/core';
import IconButton from '@/components/Button/IconButton';
import { IconBraces, IconFilterHeart, IconMaximize, IconPlus, IconTable, IconTrash } from '@tabler/icons-react';
import { STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT, STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import Querier from './Querier';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCallback, useEffect } from 'react';
import StreamDropdown from '@/components/Header/StreamDropdown';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import StreamingButton from '@/components/Header/StreamingButton';
import ShareButton from '@/components/Header/ShareButton';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';
import { filterStoreReducers, useFilterStore } from '../providers/FilterProvider';
import classes from './styles/PrimaryToolbar.module.css';

const { toggleDeleteModal, onToggleView } = logsStoreReducers;
const { toggleSavedFiltersModal } = filterStoreReducers;
const renderMaximizeIcon = () => <IconMaximize size={px('1rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash data-id="delete-stream-btn" size={px('1rem')} stroke={1.5} />;

export const MaximizeButton = () => {
	const [_appStore, setAppStore] = useAppStore((_store) => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderMaximizeIcon} size={38} onClick={onClick} tooltipLabel="Full screen" />;
};

export const SavedFiltersButton = () => {
	const [_store, setLogsStore] = useFilterStore((_store) => null);
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

const AddCorrelationButton = () => {
	const navigate = useNavigate();

	return (
		<Button
			className={classes.savedFiltersBtn}
			h="100%"
			onClick={() => navigate('/correlation')}
			leftSection={<IconPlus size={px('1rem')} stroke={1.5} />}>
			Add correlation
		</Button>
	);
};

const DeleteStreamButton = () => {
	const [_store, setLogsStore] = useLogsStore((_store) => null);
	const onClick = useCallback(() => setLogsStore(toggleDeleteModal), []);
	return <IconButton renderIcon={renderDeleteIcon} size={38} onClick={onClick} tooltipLabel="Delete" />;
};

const ViewToggle = () => {
	const [viewMode, setLogsStore] = useLogsStore((store) => store.viewMode);
	const iconProps = {
		style: { width: rem(20), height: rem(20), display: 'block' },
		stroke: 1.8,
	};
	const onChange = useCallback((val: string) => {
		if (_.includes(['json', 'table'], val)) {
			setLogsStore((store) => onToggleView(store, val as 'json' | 'table'));
		}
	}, []);
	return (
		<SegmentedControl
			style={{ borderRadius: rem(8) }}
			withItemsBorders={false}
			onChange={onChange}
			value={viewMode}
			data={[
				{
					value: 'table',
					label: (
						<Tooltip label="Table View">
							<IconTable {...iconProps} />
						</Tooltip>
					),
				},
				{
					value: 'json',
					label: (
						<Tooltip label="JSON View">
							<IconBraces {...iconProps} />
						</Tooltip>
					),
				},
			]}
		/>
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
					<AddCorrelationButton />
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
