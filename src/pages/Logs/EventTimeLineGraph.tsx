import { Skeleton, Stack, Text } from '@mantine/core';
import classes from './styles/EventTimeLineGraph.module.css';
import { useQueryResult } from '@/hooks/useQueryResult';
import { useEffect } from 'react';
import { useLogsPageContext } from './context';
import dayjs from 'dayjs';
import { AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';

const generateCountQuery = (streamName: string, startTime: string, endTime: string) => {
	return `SELECT DATE_TRUNC('minute', p_timestamp) AS minute_range, COUNT(*) AS log_count FROM ${streamName} WHERE p_timestamp BETWEEN '${startTime}' AND '${endTime}' GROUP BY minute_range ORDER BY minute_range`;
};

const NoDataView = () => {
	return (
		<Stack style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Stack className={classes.noDataContainer}>
				<Text className={classes.noDataText}>No new events in the last 10 minutes.</Text>
			</Stack>
		</Stack>
	);
};

const EventTimeLineGraph = () => {
	const { fetchQueryMutation } = useQueryResult();
	const {
		state: { currentStream },
	} = useLogsPageContext();
	const endTime = dayjs().subtract(1, 'minute').startOf('minute');
	const startTime = endTime.subtract(10, 'minute').startOf('minute');

	useEffect(() => {
		if (!currentStream || currentStream.length === 0) return;

		const logsQuery = {
			streamName: currentStream,
			startTime: startTime.toDate(),
			endTime: endTime.toDate(),
			access: [],
		};
		const query = generateCountQuery(currentStream, startTime.toISOString(), endTime.toISOString());
		fetchQueryMutation.mutate({
			logsQuery,
			query,
		});
	}, [currentStream]);

	const graphData = fetchQueryMutation?.data;
	const isLoading = fetchQueryMutation.isLoading;
	const hasData = Array.isArray(graphData) && graphData.length !== 0;

	return (
		<Stack className={classes.graphContainer}>
			<Skeleton
				visible={fetchQueryMutation.isLoading}
				h="100%"
				w={isLoading ? '98%' : '100%'}
				style={isLoading ? { marginLeft: '1.8rem', alignSelf: 'center' } : !hasData ? { marginLeft: '1rem' } : {}}>
				{hasData ? (
					<AreaChart
						h="100%"
						data={graphData}
						dataKey="minute_range"
						series={[{ name: 'log_count', color: 'indigo.6', label: 'Events' }]}
						valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
						withXAxis={false}
						withYAxis={hasData}
						curveType="linear"
						yAxisProps={{ tickCount: 2, tickFormatter: (value) => `${HumanizeNumber(value)}` }}
						gridAxis="xy"
						withGradient={false}
					/>
				) : (
					<NoDataView />
				)}
			</Skeleton>
		</Stack>
	);
};

export default EventTimeLineGraph;
