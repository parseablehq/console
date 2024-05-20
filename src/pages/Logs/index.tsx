import { Box, Stack, Text } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import StaticLogTable from './StaticLogTable';
import LiveLogTable from './LiveLogTable';
import ViewLog from './ViewLog';
import DeleteStreamModal from './DeleteStreamModal';
import AlertsModal from './AlertsModal';
import RententionModal from './RetentionModal';
import PrimaryToolbar from './PrimaryToolbar';
import SecondaryToolbar from './SecondaryToolbar';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useLogsStore } from './providers/LogsProvider';
import SideBar from './Sidebar';
import Management from './Management';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useStreamStore, streamStoreReducers } from './providers/StreamProvider';
import _ from 'lodash';

const {setCleanStoreForStreamChange} = streamStoreReducers;

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [currentView] = useLogsStore((store) => store.currentView);
	const [sideBarOpen] = useLogsStore((store) => store.sideBarOpen);
	const [, setStreamStore] = useStreamStore(store => null)

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
	const shouldDisplayToolbar = currentView !== 'manage'

	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'row', width: '100%' }}>
			<DeleteStreamModal />
			<AlertsModal />
			<RententionModal />
			<ViewLog />
			<Stack w={sideBarWidth}>
				<SideBar open={sideBarOpen} />
			</Stack>
			<Stack gap={8} w={contentWidth}>
				{shouldDisplayToolbar && <SecondaryToolbar />}
				{shouldDisplayToolbar && <PrimaryToolbar />}
				{currentView === 'explore' ? <StaticLogTable /> : currentView === 'live-tail' ? <LiveLogTable /> : <Management/>}
			</Stack>
		</Box>
	);
};

export default Logs;
