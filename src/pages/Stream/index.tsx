import { Box, Stack, rem } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useCallback, useEffect } from 'react';
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
import { Text } from '@mantine/core';
import { RetryBtn } from '@/components/Button/Retry';

const { streamChangeCleanup } = streamStoreReducers;

const SchemaErrorView = (props: { error: string; fetchSchema: () => void }) => {
	return (
		<Stack style={{ border: '1px solid', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Stack gap={0}>
				<Text c="red.8" style={{ fontWeight: 400, textAlign: 'center' }}>
					{props.error || 'Error'}
				</Text>
				<Box>
					<RetryBtn onClick={props.fetchSchema} mt="md" />
				</Box>
			</Stack>
		</Stack>
	);
};

const Logs: FC = () => {
	useDocumentTitle('Parseable | Stream');
	const { view } = useParams();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);
	const [sideBarOpen, setStreamStore] = useStreamStore((store) => store.sideBarOpen);

	const { getDataSchema, loading, error } = useGetLogStreamSchema();

	const fetchSchema = useCallback(() => {
		setStreamStore(streamChangeCleanup);
		getDataSchema();
	}, []);

	useEffect(() => {
		if (!_.isEmpty(currentStream)) {
			fetchSchema();
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
					error ? (
						<SchemaErrorView error={error} fetchSchema={fetchSchema} />
					) : (
						<StaticLogTable schemaLoading={isSchemaLoading} />
					)
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
