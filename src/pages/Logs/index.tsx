import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import StaticLogTable from './LogTable';
import ViewLog from './ViewLog';
import DeleteStreamModal from './DeleteStreamModal';
import AlertsModal from './AlertsModal';
import RententionModal from './RetentionModal';
import PrimaryToolbar from './PrimaryToolbar';
import SecondaryToolbar from './SecondaryToolbar';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useLogsStore } from './providers/LogsProvider';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const [currentStream] = useAppStore(store => store.currentStream)
	const [showLiveTail] = useLogsStore(store => store.liveTailConfig.showLiveTail)
	if (!currentStream) return null;
	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'column' }}>
			<DeleteStreamModal />
			<AlertsModal />
			<RententionModal />
			<PrimaryToolbar />
			<SecondaryToolbar />
			{showLiveTail ? <StaticLogTable /> : <StaticLogTable />}
			<ViewLog />
		</Box>
	);
};

export default Logs;
