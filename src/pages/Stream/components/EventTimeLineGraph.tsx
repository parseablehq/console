import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import classes from '../styles/EventTimeLineGraph.module.css';
import { useGraphData } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChartTooltipProps, AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';
import { logsStoreReducers, useLogsStore } from '../providers/LogsProvider';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import _ from 'lodash';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { useStreamStore } from '../providers/StreamProvider';

const { setTimeRange } = appStoreReducers;
const { makeTimeRangeLabel } = timeRangeUtils;
const { getCleanStoreForRefetch } = logsStoreReducers;

type CompactInterval = 'minute' | 'day' | 'hour' | 'quarter-hour' | 'half-hour' | 'month';

const getCompactType = (interval: number): CompactInterval => {
	const totalMinutes = interval / (1000 * 60);
	if (totalMinutes <= 60) {
		// upto 1 hour
		return 'minute';
	} else if (totalMinutes <= 300) {
		// upto 5 hours
		return 'quarter-hour';
	} else if (totalMinutes <= 1440) {
		// upto 5 hours
		return 'half-hour';
	} else if (totalMinutes <= 4320) {
		// upto 3 days
		return 'hour';
	} else if (totalMinutes <= 259200) {
		return 'day';
	} else {
		return 'month';
	}
};

const NoDataView = (props: { isError: boolean }) => {
	return (
		<Stack style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Stack className={classes.noDataContainer}>
				<Text className={classes.noDataText}>
					{props.isError ? 'Failed to fetch data' : ' No new events in the selected time range.'}
				</Text>
			</Stack>
		</Stack>
	);
};

const calcAverage = (data: LogsResponseWithHeaders | undefined) => {
	if (!data || !Array.isArray(data?.records)) return 0;

	const { fields, records } = data;
	if (_.isEmpty(records) || !_.includes(fields, 'log_count')) return 0;

	const total = records.reduce((acc, d) => {
		return acc + _.toNumber(d.log_count) || 0;
	}, 0);
	return parseInt(Math.abs(total / records.length).toFixed(0));
};

type GraphTickItem = {
	events: number;
	minute: Date;
	aboveAvgPercent: number;
	compactType: CompactInterval;
	startTime: dayjs.Dayjs;
	endTime: dayjs.Dayjs;
};

type LogRecord = {
	date_bin_timestamp: string;
	log_count: number;
};

// date_bin removes tz info
// filling data with empty values where there is no rec
const parseGraphData = (
	data: LogsResponseWithHeaders | undefined,
	avg: number,
	startTime: Date,
	endTime: Date,
	interval: number,
): GraphTickItem[] => {
	if (!data || !Array.isArray(data?.records)) return [];

	const { fields, records } = data;
	if (_.isEmpty(records) || !_.includes(fields, 'log_count') || !_.includes(fields, 'date_bin_timestamp')) return [];

	const compactType = getCompactType(interval);
	const ticksCount = interval < 10 * 60 * 1000 ? interval / (60 * 1000) : interval < 60 * 60 * 1000 ? 10 : 60;
	const intervalDuration = (endTime.getTime() - startTime.getTime()) / ticksCount;

	const isValidRecord = (record: any): record is LogRecord => {
		return typeof record.date_bin_timestamp === 'string' && typeof record.log_count === 'number';
	};

	const allTimestamps = Array.from(
		{ length: ticksCount },
		(_, index) => new Date(startTime.getTime() + index * intervalDuration),
	);

	const parsedData = allTimestamps.map((ts) => {
		const countData = records.find((d) => {
			if (!isValidRecord(d)) return false;
			const recordTime = new Date(d.date_bin_timestamp).getTime();
			const tsTime = ts.getTime();
			return Math.abs(recordTime - tsTime) < intervalDuration / 2;
		});

		const defaultOpts = {
			events: 0,
			minute: ts,
			aboveAvgPercent: 0,
			compactType,
			startTime: dayjs(ts),
			endTime: dayjs(new Date(ts.getTime() + intervalDuration)),
		};

		if (!countData || !isValidRecord(countData)) {
			return defaultOpts;
		}

		const aboveAvgCount = countData.log_count - avg;
		const aboveAvgPercent = avg > 0 ? parseInt(((aboveAvgCount / avg) * 100).toFixed(2)) : 0;

		return {
			...defaultOpts,
			events: countData.log_count,
			aboveAvgPercent,
		};
	});

	return parsedData;
};

function ChartTooltip({ payload }: ChartTooltipProps) {
	if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

	const { aboveAvgPercent, events, startTime, endTime } = payload[0]?.payload as GraphTickItem;
	const isAboveAvg = aboveAvgPercent > 0;
	const label = makeTimeRangeLabel(startTime.toDate(), endTime.toDate());

	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{label}
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
	const { fetchGraphDataMutation } = useGraphData();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ custSearchQuery }, setLogStore] = useLogsStore((store) => store.custQuerySearchState);
	const [{ interval, startTime, endTime }] = useAppStore((store) => store.timeRange);
	const [localStream, setLocalStream] = useState<string | null>('');
	const [{ info }] = useStreamStore((store) => store);
	const firstEventAt = 'first-event-at' in info ? info['first-event-at'] : undefined;

	useEffect(() => {
		setLocalStream(currentStream);
	}, [currentStream]);

	useEffect(() => {
		if (!localStream || localStream.length === 0 || !firstEventAt) return;
		const totalMinutes = interval / (1000 * 60);
		const numBins = totalMinutes < 10 ? totalMinutes : totalMinutes < 60 ? 10 : 60;
		const logsQuery = {
			stream: localStream,
			startTime: dayjs(startTime).toISOString(),
			endTime: dayjs(endTime).add(1, 'minute').toISOString(),
			numBins,
		};
		fetchGraphDataMutation.mutate(logsQuery);
	}, [localStream, startTime.toISOString(), endTime.toISOString(), custSearchQuery, firstEventAt]);

	const isLoading = fetchGraphDataMutation.isLoading;
	const avgEventCount = useMemo(() => calcAverage(fetchGraphDataMutation?.data), [fetchGraphDataMutation?.data]);
	const graphData = useMemo(() => {
		if (!firstEventAt) return null;
		return parseGraphData(fetchGraphDataMutation?.data, avgEventCount, startTime, endTime, interval);
	}, [fetchGraphDataMutation?.data, interval, firstEventAt]);
	const hasData = Array.isArray(graphData) && graphData.length !== 0;
	const [, setAppStore] = useAppStore((_store) => null);
	const setTimeRangeFromGraph = useCallback((barValue: any) => {
		const activePayload = barValue?.activePayload;
		if (!Array.isArray(activePayload) || activePayload.length === 0) return;

		const currentPayload = activePayload[0];
		if (!currentPayload || typeof currentPayload !== 'object') return;

		const graphTickItem = currentPayload.payload as GraphTickItem;
		if (!graphTickItem || typeof graphTickItem !== 'object' || _.isEmpty(graphTickItem)) return;

		const { startTime, endTime } = graphTickItem;
		setLogStore((store) => getCleanStoreForRefetch(store));
		setAppStore((store) => setTimeRange(store, { type: 'custom', startTime: startTime, endTime: endTime }));
	}, []);

	return (
		<Stack className={classes.graphContainer}>
			<Skeleton
				visible={fetchGraphDataMutation.isLoading}
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
							content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
							position: { y: -20 },
						}}
						valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
						withXAxis={false}
						withYAxis={hasData}
						yAxisProps={{ tickCount: 2, tickFormatter: (value) => `${HumanizeNumber(value)}` }}
						referenceLines={[{ y: avgEventCount, color: 'gray.5', label: 'Avg' }]}
						tickLine="none"
						areaChartProps={{ onClick: setTimeRangeFromGraph, style: { cursor: 'pointer' } }}
						gridAxis="xy"
						fillOpacity={0.5}
						strokeWidth={1.25}
						dotProps={{ strokeWidth: 1, r: 2.5 }}
					/>
				) : (
					<NoDataView isError={fetchGraphDataMutation.isError} />
				)}
			</Skeleton>
		</Stack>
	);
};

export default EventTimeLineGraph;
