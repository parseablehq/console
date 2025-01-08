import { Box, Stack } from '@mantine/core';
import { useDocumentTitle, useHotkeys } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import LiveLogTable from './Views/LiveTail/LiveLogTable';
import ViewLog from './components/ViewLog';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import SideBar from './components/Sidebar';
import Management from './Views/Manage/Management';
import { useStreamStore, streamStoreReducers } from './providers/StreamProvider';
import _ from 'lodash';
import SecondaryToolbar from './components/SecondaryToolbar';
import { PRIMARY_HEADER_HEIGHT, SECONDARY_SIDEBAR_WIDTH } from '@/constants/theme';
import PrimaryToolbar from './components/PrimaryToolbar';
import { useParams } from 'react-router-dom';
import { STREAM_VIEWS } from '@/constants/routes';
import LogsView from './Views/Explore/LogsView';
import useParamsController from './hooks/useParamsController';
import { useFetchCount } from '@/hooks/useQueryResult';

const { streamChangeCleanup, toggleSideBar } = streamStoreReducers;

const Stream: FC = () => {
	useDocumentTitle('Parseable | Stream');
	const { view } = useParams();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const { isStoreSynced } = useParamsController();
	const [maximized] = useAppStore((store) => store.maximized);
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [instanceConfig] = useAppStore((store) => store.instanceConfig);
	const [, setStreamStore] = useStreamStore((store) => store.sideBarOpen);
	const { refetchCount } = useFetchCount();

	useHotkeys([['mod+/', () => setStreamStore((store) => toggleSideBar(store))]]);

	useEffect(() => {
		if (isStoreSynced) {
			if (!_.isEmpty(currentStream)) {
				if (view === 'explore') {
					setStreamStore(streamChangeCleanup);
					refetchCount();
				}
			}
		}
	}, [isStoreSynced, currentStream, timeRange]);

	const sideBarWidth = SECONDARY_SIDEBAR_WIDTH;

	if (!currentStream) return null;
	if (!_.includes(STREAM_VIEWS, view)) return null;

	const isStoreSyncing = (!isStoreSynced || instanceConfig === null) && view === 'explore';
	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				flexDirection: 'row',
				width: '100%',
			}}>
			<ViewLog />
			<Stack style={{ width: sideBarWidth }}>
				<SideBar />
			</Stack>
			<Stack
				gap={0}
				style={{
					maxHeight: `calc(100vh - ${maximized ? 0 : PRIMARY_HEADER_HEIGHT}px )`,
					overflowY: 'scroll',
					flex: 1,
				}}>
				<PrimaryToolbar />
				{view === 'explore' && <SecondaryToolbar />}
				{view === 'explore' ? (
					<LogsView isStoreSyncing={isStoreSyncing} />
				) : view === 'live-tail' ? (
					<LiveLogTable />
				) : (
					<Management />
				)}
			</Stack>
		</Box>
	);
};

export default Stream;
