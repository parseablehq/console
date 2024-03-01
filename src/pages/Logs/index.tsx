import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import StaticLogTable from './LogTable';
import LiveLogTable from '../LiveTail/LogTable';
import ViewLog from './ViewLog';
import DeleteStreamModal from './DeleteStreamModal';
import AlertsModal from './AlertsModal';
import RententionModal from './RetentionModal';
import { useLogsPageContext } from './logsContextProvider';
import PrimaryToolbar from './PrimaryToolbar';
import SecondaryToolbar from './SecondaryToolbar';
import { useHeaderContext } from '@/layouts/MainLayout/Context';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const {
		state: { maximized },
	} = useHeaderContext();
	const {
		state: { liveTailToggled },
	} = useLogsPageContext();

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
