import { Box, Stack, Text } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
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

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const [currentStream] = useAppStore(store => store.currentStream)
	const [showLiveTail] = useLogsStore(store => store.liveTailConfig.showLiveTail)
    const [sideBarOpen] = useLogsStore(store => store.sideBarOpen)
	
	if (!currentStream) return null;
	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'row' }}>
			<DeleteStreamModal />
			<AlertsModal />
			<RententionModal />
			<ViewLog />
			<Stack w="13%">
				<SideBar open={sideBarOpen} />
			</Stack>
			<Stack gap={0} w="87%">
				<PrimaryToolbar />
				<SecondaryToolbar />
				{showLiveTail ? <LiveLogTable /> : <StaticLogTable />}
			</Stack>
		</Box>
	);
};

export default Logs;
