import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import StaticLogTable from './LogTable';
import LiveLogTable from '../LiveTail/LogTable';
import ViewLog from './ViewLog';
import DeleteStreamModal from './DeleteStreamModal';
import AlertsModal from './AlertsModal';
import RententionModal from './RetentionModal';
import { useLogsPageContext } from './logsContextProvider';
import PrimaryToolbar from './PrimaryToolbar';
import SecondaryToolbar from './SecondaryToolbar';
import { useAppStore, appStoreReducers } from '@/layouts/MainLayout/AppProvider';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';

const { streamChangeCleanup } = logsStoreReducers;
const { toggleMaximize, setStreamSpecificUserAccess } = appStoreReducers;

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const [maximized, setAppStore] = useAppStore((store) => store.maximized);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [, setLogsStore] = useLogsStore((_store) => null);
	const {
		state: { liveTailToggled },
	} = useLogsPageContext();

	useEffect(() => {
		const handleEscKeyPress = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				maximized && setAppStore(toggleMaximize);
			}
		};
		window.addEventListener('keydown', handleEscKeyPress);
		return () => {
			window.removeEventListener('keydown', handleEscKeyPress);
		};
	}, [maximized]);

	useEffect(() => {
		if (currentStream) {
			setLogsStore(streamChangeCleanup);
			setAppStore(setStreamSpecificUserAccess);
		}
	}, [currentStream]);

	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'column' }}>
			<DeleteStreamModal />
			<AlertsModal />
			<RententionModal />
			{!maximized && (
				<>
					<PrimaryToolbar />
					<SecondaryToolbar />
				</>
			)}
			{liveTailToggled ? <LiveLogTable /> : <StaticLogTable />}
			{/* TODO: need to move the live logtable into the Logs folder */}
			<ViewLog />
		</Box>
	);
};

export default Logs;
