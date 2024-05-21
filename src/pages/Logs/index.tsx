import { Box, Stack, Text } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useMemo } from 'react';
import StaticLogTable from './StaticLogTable';
import LiveLogTable from './LiveLogTable';
import ViewLog from './ViewLog';
import DeleteStreamModal from './DeleteStreamModal';
import AlertsModal from './AlertsModal';
import RententionModal from './RetentionModal';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useLogsStore } from './providers/LogsProvider';
import SideBar from './Sidebar';
import Management from './Management';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useStreamStore, streamStoreReducers, currentView } from './providers/StreamProvider';
import _ from 'lodash';
import SecondaryToolbar from './SecondaryToolbar';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT, LOGS_SECONDARY_TOOLBAR_HEIGHT, PRIMARY_HEADER_HEIGHT, STREAM_PRIMARY_TOOLBAR_HEIGHT, STREAM_SECONDARY_TOOLBAR_HRIGHT } from '@/constants/theme';
import PrimaryToolbar from './PrimaryToolbar';

const {setCleanStoreForStreamChange} = streamStoreReducers;

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [currentView] = useLogsStore((store) => store.currentView);
	const [maximized] = useAppStore((store) => store.maximized);
	const [sideBarOpen] = useLogsStore((store) => store.sideBarOpen);
	const [, setStreamStore] = useStreamStore((store) => null);

	const { getDataSchema, loading: schemaLoading, error: logStreamSchemaError } = useGetLogStreamSchema();

	useEffect(() => {
		if (!_.isEmpty(currentStream)) {
			setStreamStore(setCleanStoreForStreamChange);
			getDataSchema();
		}
	}, [currentStream]);

	if (!currentStream) return null;
	const sideBarWidth = sideBarOpen ? '13%' : '5%';
	const contentWidth = sideBarOpen ? '87%' : '95%';

	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'row', width: '100%' }}>
			<DeleteStreamModal />
			<AlertsModal />
			<RententionModal />
			<ViewLog />
			<Stack w={sideBarWidth} miw={100}>
				<SideBar open={sideBarOpen} />
			</Stack>
			<Stack
				gap={0}
				w={contentWidth}
				style={{
					maxHeight: `calc(100vh - ${maximized ? 0 : PRIMARY_HEADER_HEIGHT}px )`,
				}}>
				<PrimaryToolbar />
				{currentView === 'explore' && <SecondaryToolbar />}
				{currentView === 'explore' ? (
					<StaticLogTable />
				) : currentView === 'live-tail' ? (
					<LiveLogTable />
				) : (
					<Management />
				)}
			</Stack>
		</Box>
	);
};

export default Logs;
