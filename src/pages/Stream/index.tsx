import { Box, Stack, rem } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import StaticLogTable from './Views/Explore/StaticLogTable';
import LiveLogTable from './Views/LiveTail/LiveLogTable';
import ViewLog from './components/ViewLog';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import SideBar from './components/Sidebar';
import Management from './Views/Manage/Management';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useStreamStore, streamStoreReducers } from './providers/StreamProvider';
import _ from 'lodash';
import SecondaryToolbar from './components/SecondaryToolbar';
import { PRIMARY_HEADER_HEIGHT, SECONDARY_SIDEBAR_WIDTH } from '@/constants/theme';
import PrimaryToolbar from './components/PrimaryToolbar';
import { useParams } from 'react-router-dom';
import { STREAM_VIEWS } from '@/constants/routes';

const { streamChangeCleanup } = streamStoreReducers;

const Logs: FC = () => {
	useDocumentTitle('Parseable | Stream');
	const { view } = useParams();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);
	const [sideBarOpen, setStreamStore] = useStreamStore((store) => store.sideBarOpen);

	const { getDataSchema, loading, error } = useGetLogStreamSchema();

	useEffect(() => {
		if (!_.isEmpty(currentStream)) {
			setStreamStore(streamChangeCleanup);
			getDataSchema();
		}
	}, [currentStream]);

	const sideBarWidth = sideBarOpen ? rem(180) : SECONDARY_SIDEBAR_WIDTH;

	if (!currentStream) return null;
	if (!_.includes(STREAM_VIEWS, view)) return null;

	const isSchemaLoading = !error && loading;
	// todo - have separate ui components for loading and error states

	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'row', width: '100%' }}>
			<ViewLog />
			<Stack style={{ width: sideBarWidth }}>
				<SideBar />
			</Stack>
			<Stack
				gap={0}
				style={{
					maxHeight: `calc(100vh - ${maximized ? 0 : PRIMARY_HEADER_HEIGHT}px )`,
					overflow: 'scroll',
					flex: 1,
				}}>
				<PrimaryToolbar />
				{view === 'explore' && <SecondaryToolbar />}
				{view === 'explore' ? (
					<StaticLogTable schemaLoading={isSchemaLoading} />
				) : view === 'live-tail' ? (
					<LiveLogTable />
				) : (
					<Management schemaLoading={isSchemaLoading} />
				)}
			</Stack>
		</Box>
	);
};

export default Logs;
