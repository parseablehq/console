import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import classes from './styles/EventTimeLineGraph.module.css';
import { useQueryResult } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLogsPageContext } from './logsContextProvider';
import dayjs, { Dayjs } from 'dayjs';
import {  ChartTooltipProps, AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';
import { useHeaderContext } from '@/layouts/MainLayout/Context';

const START_RANGE = 30
const END_RANGE = 2

const generateCountQuery = (streamName: string, startTime: string, endTime: string) => {
	return `SELECT DATE_TRUNC('minute', p_timestamp) AS minute_range, COUNT(*) AS log_count FROM ${streamName} WHERE p_timestamp BETWEEN '${startTime}' AND '${endTime}' GROUP BY minute_range ORDER BY minute_range`;
};

const NoDataView = () => {
	return (
		<Stack style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Stack className={classes.noDataContainer}>
				<Text className={classes.noDataText}>No new events in the last 30 minutes.</Text>
			</Stack>
		</Stack>
	);
};

type GraphRecord = {
	minute_range: string;
	log_count: number;
};

const calcAverage = (data: GraphRecord[]) => {
	if (!Array.isArray(data) || data.length === 0) return 0;

	const total = data.reduce((acc, d) => {
		return acc + d.log_count;
	}, 0);
	return parseInt(Math.abs(total / data.length).toFixed(0));
};

const getAllTimestamps = (startTime: Dayjs) => {
	const timestamps = [];
	for (let i = 0; i < START_RANGE; i++) {
		const ts = startTime.add(i + 1, 'minute')
		timestamps.push(ts.toISOString().split('.')[0]+"Z")
	}
	return timestamps;
}

// date_trunc removes tz info
// filling data empty values where there is no rec
const parseGraphData = (data: GraphRecord[], avg: number, startTime: Dayjs) => {
	if (!Array.isArray(data) || data.length === 0) return [];

	const allTimestamps = getAllTimestamps(startTime)
	const parsedData = allTimestamps.map((ts) => {
		const countData = data.find((d) => `${d.minute_range}Z` === ts);
		if (!countData || typeof countData !== 'object') {
			return {
				events: 0,
				minute: ts,
				aboveAvgPercent: 0,
			};
		} else {
			const aboveAvgCount = countData.log_count - avg;
			const aboveAvgPercent = parseInt(((aboveAvgCount / avg) * 100).toFixed(2));
			return {
				events: countData.log_count,
				minute: `${countData.minute_range}Z`,
				aboveAvgPercent,
			};
		}
	});

	return parsedData;
};

function ChartTooltip({ payload }: ChartTooltipProps) {
	if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

	const totalEvents = payload.reduce((acc, item: any) => {
		return acc + item.value;
	}, 0);

	const { minute, aboveAvgPercent } = payload[0]?.payload || {};
	const isAboveAvg = aboveAvgPercent > 0;
	const startTime = dayjs(minute).utc(true);
	const endTime = dayjs(minute).add(60, 'seconds');
	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{`${startTime.format('HH:mm:ss A')} - ${endTime.format('HH:mm:ss A')}`}
			</Text>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text>Events</Text>
				<Text>{totalEvents}</Text>
			</Stack>
			<Stack mt={4} style={{ flexDirection: 'row', justifyContent: 'center' }}>
				<Text size="sm" c={isAboveAvg ? 'red.6' : 'green.8'}>{`${
					isAboveAvg ? '+' : ''
				}${aboveAvgPercent}% ${isAboveAvg ? 'above' : 'below'} avg (Last 30 mins)`}</Text>
			</Stack>
		</Paper>
	);
}

const generateTimeOpts = () => {
	const endTime = dayjs().subtract(END_RANGE, 'minute').startOf('minute');
	const startTime = endTime.subtract(START_RANGE, 'minute').startOf('minute');
	return { startTime, endTime };
};

const EventTimeLineGraph = () => {
	const { fetchQueryMutation } = useQueryResult();
	const {
		state: { currentStream },
	} = useLogsPageContext();
	const [timeOpts, _setTimeOpts] = useState<{ startTime: Dayjs; endTime: Dayjs }>(generateTimeOpts());
	const { endTime, startTime } = timeOpts;

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

	const isLoading = fetchQueryMutation.isLoading;
	const avgEventCount = useMemo(() => calcAverage(fetchQueryMutation?.data), [fetchQueryMutation?.data]);
	const graphData = useMemo(() => parseGraphData(fetchQueryMutation?.data, avgEventCount, startTime), [fetchQueryMutation?.data]);
	const hasData = Array.isArray(graphData) && graphData.length !== 0;

	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();

	const setTimeRange = useCallback((barValue: any) => {
		const activePayload = barValue?.activePayload;
		if (!Array.isArray(activePayload) || activePayload.length === 0) return;

		const samplePayload = activePayload[0];
		if (!samplePayload || typeof samplePayload !== 'object') return;

		const { minute } = samplePayload.payload || {};
		const startTime = dayjs(minute);
		const endTime = dayjs(minute).add(60, 'seconds');
		subLogQuery.set((query) => {
			query.startTime = startTime.toDate();
			query.endTime = endTime.toDate();
		});

		subLogSelectedTimeRange.set((state) => {
			state.state = 'custom';
			state.value = `${startTime.format('DD-MM-YY HH:mm:ss')} - ${endTime.format('DD-MM-YY HH:mm:ss')}`;
		});
	}, []);

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
						dataKey="minute"
						series={[{ name: 'events', color: 'indigo.5', label: 'Events' }]}
						tooltipProps={{
							content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
							position: { y: -20 },
						}}
						valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
						withXAxis={false}
						withYAxis={hasData}
						yAxisProps={{ tickCount: 2, tickFormatter: (value) => `${HumanizeNumber(value)}` }}
						referenceLines={[{ y: avgEventCount, color: 'red.6', label: 'Avg' }]}
						tickLine="none"
						areaChartProps={{ onClick: setTimeRange, style: { cursor: 'pointer' }}}
						gridAxis="xy"
						fillOpacity={0.5}
					/>
				) : (
					<NoDataView />
				)}
			</Skeleton>
		</Stack>
	);
};

export default EventTimeLineGraph;
