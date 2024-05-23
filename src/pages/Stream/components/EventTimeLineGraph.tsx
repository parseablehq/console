import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import classes from '../styles/EventTimeLineGraph.module.css';
import { useQueryResult } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChartTooltipProps, AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';
import { logsStoreReducers, useLogsStore } from '../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
const { setTimeRange } = logsStoreReducers;

const getCompactType = (interval: number) => {
	const totalMinutes = interval / (1000 * 60);
	if (totalMinutes <= 60) { // 1 hour
		return 'minute'
	} else if (totalMinutes <= 4320) { // 3 days
		return 'hour'
	} else {
		return 'day'
	}
}

const getStartOfTs = (time: Date, compactType:  'day' | 'hour' | 'minute'): Date => {
	if (compactType === 'minute') {
		return time;
	} else if (compactType === 'hour') {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours());
	} else {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate());
	}
}

const getEndOfTs = (time: Date, compactType:  'day' | 'hour' | 'minute'): Date => {
	if (compactType === 'minute') {
		return time;
	} else if (compactType === 'hour') {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours() + 1);
	} else {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1);
	}
}

const getAllIntervals = (start: Date, end: Date, compactType: 'minute' | 'hour' | 'day'): Date[] => {
    const result = [];
    const current = new Date(start);

    const increment = (date: Date, type: 'minute' | 'hour' | 'day') => {
        switch (type) {
            case 'minute':
                date.setMinutes(date.getMinutes() + 1);
                break;
            case 'hour':
                date.setHours(date.getHours() + 1);
                break;
            case 'day':
                date.setDate(date.getDate() + 1);
                break;
        }
    }

    while (current <= end) {
        result.push(new Date(current));
        increment(current, compactType);
    }

    return result;
}

const getModifiedTimeRange = (
	startTime: Date,
	endTime: Date,
	interval: number,
): { modifiedStartTime: Date; modifiedEndTime: Date; compactType: 'day' | 'minute' | 'hour' } => {
	const compactType = getCompactType(interval);
	const modifiedStartTime = getStartOfTs(startTime, compactType);
	const modifiedEndTime = getEndOfTs(endTime, compactType);
	return { modifiedEndTime, modifiedStartTime, compactType };
};	

const generateCountQuery = (streamName: string, startTime: Date, endTime: Date, interval: number) => {
	const { modifiedEndTime, modifiedStartTime, compactType } = getModifiedTimeRange(startTime, endTime, interval);
	return `SELECT DATE_TRUNC(${compactType}, p_timestamp) AS timestamp, COUNT(*) AS log_count FROM ${streamName} WHERE p_timestamp BETWEEN '${modifiedStartTime.toISOString()}' AND '${modifiedEndTime.toISOString()}' GROUP BY timestamp ORDER BY timestamp`;
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
	timestamp: string;
	log_count: number;
};

const calcAverage = (data: GraphRecord[]) => {
	if (!Array.isArray(data) || data.length === 0) return 0;

	const total = data.reduce((acc, d) => {
		return acc + d.log_count;
	}, 0);
	return parseInt(Math.abs(total / data.length).toFixed(0));
};

// date_trunc removes tz info
// filling data empty values where there is no rec
const parseGraphData = (data: GraphRecord[], avg: number, startTime: Date, endTime: Date, interval: number) => {
	if (!Array.isArray(data) || data.length === 0) return [];
	const { modifiedEndTime, modifiedStartTime, compactType } = getModifiedTimeRange(startTime, endTime, interval);

	const allTimestamps = getAllIntervals(modifiedStartTime, modifiedEndTime, compactType)
	const parsedData = allTimestamps.map((ts) => {
		const countData = data.find((d) => `${d.timestamp}Z` === ts.toISOString());
		if (!countData || typeof countData !== 'object') {
			return {
				events: 0,
				minute: ts,
				aboveAvgPercent: 0,
				compactType
			};
		} else {
			const aboveAvgCount = countData.log_count - avg;
			const aboveAvgPercent = parseInt(((aboveAvgCount / avg) * 100).toFixed(2));
			return {
				events: countData.log_count,
				minute: `${countData.timestamp}Z`,
				aboveAvgPercent,
				compactType
			};
		}
	});

	return parsedData;
};

function ChartTooltip({ payload }: ChartTooltipProps) {
	if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

	const { minute, aboveAvgPercent, events, compactType } = payload[0]?.payload || {};
	const isAboveAvg = aboveAvgPercent > 0;
	const startTime = dayjs(minute).utc(true);
	const endTime = dayjs(minute).add(1, compactType);
	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{`${startTime.format('DD MMM HH:mm A')} - ${endTime.format('DD MMM HH:mm A')}`}
			</Text>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text>Events</Text>
				<Text>{events}</Text>
			</Stack>
			<Stack mt={4} style={{ flexDirection: 'row' }}>
				<Text size="sm" c={isAboveAvg ? 'red.6' : 'green.8'}>{`${isAboveAvg ? '+' : ''}${aboveAvgPercent}% ${
					isAboveAvg ? 'above' : 'below'
				} average in the given time-range`}</Text>
			</Stack>
		</Paper>
	);
}

const EventTimeLineGraph = () => {
	const { fetchQueryMutation } = useQueryResult();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{interval, startTime, endTime}] = useLogsStore(store => store.timeRange)

	useEffect(() => {
		if (!currentStream || currentStream.length === 0) return;

		const logsQuery = {
			streamName: currentStream,
			startTime,
			endTime,
			access: [],
		};
		
		const query = generateCountQuery(currentStream, startTime, endTime, interval);
		fetchQueryMutation.mutate({
			logsQuery,
			query,
		});
	}, [currentStream, startTime.toISOString(), endTime.toISOString()]);

	const isLoading = fetchQueryMutation.isLoading;
	const avgEventCount = useMemo(() => calcAverage(fetchQueryMutation?.data), [fetchQueryMutation?.data]);
	const graphData = useMemo(
		() => parseGraphData(fetchQueryMutation?.data, avgEventCount, startTime, endTime, interval),
		[fetchQueryMutation?.data, interval],
	);
	const hasData = Array.isArray(graphData) && graphData.length !== 0;
	const [, setLogsStore] = useLogsStore((store) => store.timeRange);
	const setTimeRangeFromGraph = useCallback((barValue: any) => {
		const activePayload = barValue?.activePayload;
		if (!Array.isArray(activePayload) || activePayload.length === 0) return;

		const samplePayload = activePayload[0];
		if (!samplePayload || typeof samplePayload !== 'object') return;

		const { minute, compactType } = samplePayload.payload || {};
		const startTime = dayjs(minute);
		const endTime = dayjs(minute).add(1, compactType);
		setLogsStore((store) =>
			setTimeRange(store, { type: 'custom', startTime: startTime, endTime: endTime }),
		);
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
						w="100%"
						data={graphData}
						dataKey="minute"
						series={[{ name: 'events', color: 'indigo.5', label: 'Events' }]}
						tooltipProps={{
							content: ({ label, payload }) => <ChartTooltip label={label} payload={payload}/>,
							position: { y: -20 },
						}}
						valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
						withXAxis={false}
						withYAxis={hasData}
						yAxisProps={{ tickCount: 2, tickFormatter: (value) => `${HumanizeNumber(value)}` }}
						referenceLines={[{ y: avgEventCount, color: 'red.6', label: 'Avg' }]}
						tickLine="none"
						areaChartProps={{ onClick: setTimeRangeFromGraph, style: { cursor: 'pointer' } }}
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
