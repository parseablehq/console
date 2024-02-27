import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import StaticLogTable from './LogTable';
import LiveLogTable from '../LiveTail/LogTable';
import ViewLog from './ViewLog';
import DeleteStreamModal from './DeleteStreamModal';
import AlertsModal from './AlertsModal';
import RententionModal from './RetentionModal';
import { useLogsPageContext } from './context';
import PrimaryToolbar from './PrimaryToolbar';
import SecondaryToolbar from './SecondaryToolbar';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useAlertsEditor } from '@/hooks/useAlertsEditor';
import { useRetentionEditor } from '@/hooks/useRetentionEditor';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const {
		state: { maximized },
	} = useHeaderContext();
	const {
		state: { liveTailToggled, currentStream },
	} = useLogsPageContext();

	const { handleAlertQueryChange, submitAlertQuery, getLogAlertData } = useAlertsEditor(currentStream);
	const { handleRetentionQueryChange, submitRetentionQuery, getLogRetentionData } = useRetentionEditor(currentStream);

	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'column' }}>
			<DeleteStreamModal />
			{/* <AlertsModal data={{}}/> */}
			<AlertsModal data={getLogAlertData?.data} handleChange={handleAlertQueryChange} handleSubmit={submitAlertQuery} />
			<RententionModal
				data={getLogRetentionData?.data}
				handleChange={handleRetentionQueryChange}
				handleSubmit={submitRetentionQuery}
			/>
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
