import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import StaticLogTable from './LogTable';
import LiveLogTable from '../LiveTail/LogTable'
import ViewLog from './ViewLog';
import DeleteStreamModal from './DeleteStreamModal';
import AlertsModal from './AlertsModal';
import RententionModal from './RetentionModal';
import { useLogsPageContext } from './context';
import PrimaryToolbar from './PrimaryToolbar';
import SecondaryToolbar from './SecondaryToolbar';
import { useHeaderContext } from '@/layouts/MainLayout/Context';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');
	const {
		state: { liveTailToggled },
	} = useLogsPageContext();
	const {
		state: { maximized },
	} = useHeaderContext();

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
			{/* {liveTailToggled ? <LiveLogTable /> : <StaticLogTable />} */}
			{/* TODO: need to move the live logtable into the Logs folder */}
			<StaticLogTable />
			<ViewLog />
		</Box>
	);
};

export default Logs;
