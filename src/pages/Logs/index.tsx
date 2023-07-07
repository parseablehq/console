import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import LogTable from './LogTable';
import { useLogsStyles } from './styles';
import ViewLog from './ViewLog';
import { DEFAULT_FIXED_DURATIONS, useLogsPageContext } from './Context';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Dashboard');

	const { classes } = useLogsStyles();
	const { container } = classes;
	const { streamName } = useParams();

	const { state: { subLogQuery, subLogSelectedTimeRange ,subLogStreamError} } = useLogsPageContext();

	useEffect(() => {
		if(streamName!== subLogQuery.get().streamName){
			const now = dayjs();
			subLogQuery.set((state) => {
				state.streamName = streamName || '';
				state.startTime = now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate();
				state.endTime = now.toDate();
			});
			subLogSelectedTimeRange.set(DEFAULT_FIXED_DURATIONS.name);
			subLogStreamError.set(null);
		}
		if(streamName===""){
			subLogStreamError.set("Please check the pathname");
		}
	}, [streamName]);

	return (
		<Box className={container}>
			<LogTable />
			<ViewLog />
		</Box>
	);
};

export default Logs;
