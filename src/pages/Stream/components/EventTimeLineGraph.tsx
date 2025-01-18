import { Skeleton, Stack, Text } from '@mantine/core';
import classes from '../styles/EventTimeLineGraph.module.css';
import { useGraphData } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { logsStoreReducers, useLogsStore } from '../providers/LogsProvider';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import _ from 'lodash';
import { useStreamStore } from '../providers/StreamProvider';
import AreaChartComponent from './AreaChartComponent';

const { setTimeRange } = appStoreReducers;
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
	if (_.isEmpty(records) || !_.includes(fields, 'count')) return 0;

	const total = records.reduce((acc, d) => {
		return acc + _.toNumber(d.count) || 0;
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
	counts_timestamp: string;
	count: number;
};

// date_bin removes tz info
// filling data with empty values where there is no rec
const parseGraphData = (data: LogsResponseWithHeaders | undefined, avg: number, interval: number): GraphTickItem[] => {
	if (!data || !Array.isArray(data?.records)) return [];

	const { fields, records } = data;
	if (
		_.isEmpty(records) ||
		!_.includes(fields, 'count') ||
		!_.includes(fields, 'start_time') ||
		!_.includes(fields, 'end_time')
	)
		return [];

	const compactType = getCompactType(interval);

	const isValidRecord = (record: any): record is LogRecord => {
		return (
			typeof record.start_time === 'string' &&
			typeof record.end_time === 'string' &&
			typeof record.count === 'number' &&
			record.start_time &&
			record.end_time
		);
	};

	// Filter valid records and sort them by start timestamp
	const validRecords = records
		.filter(isValidRecord)
		.map((record) => ({
			...record,
			startDate: record.start_time ? new Date(record.start_time) : new Date(),
			endDate: record.end_time ? new Date(record.end_time) : new Date(),
		}))
		.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

	if (validRecords.length === 0) return [];

	const parsedData = validRecords.map((record: any) => {
		const aboveAvgCount = record.count - avg;
		const aboveAvgPercent = avg > 0 ? parseInt(((aboveAvgCount / avg) * 100).toFixed(2)) : 0;

		return {
			events: record.count,
			minute: record.startDate,
			aboveAvgPercent,
			compactType,
			startTime: dayjs(record.startDate),
			endTime: dayjs(record.endDate),
		};
	});

	return parsedData;
};

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
		const numBins = Math.trunc(totalMinutes < 10 ? totalMinutes : totalMinutes < 60 ? 10 : 60);

		const logsQuery = {
			stream: localStream,
			startTime: dayjs(startTime).startOf('minute').toISOString(),
			endTime: dayjs(endTime).startOf('minute').toISOString(),
			numBins,
		};

		fetchGraphDataMutation.mutate(logsQuery);
	}, [
		localStream,
		dayjs(startTime).startOf('minute').toISOString(),
		dayjs(endTime).startOf('minute').toISOString(),
		custSearchQuery,
		firstEventAt,
	]);

	const isLoading = fetchGraphDataMutation.isLoading;
	const avgEventCount = useMemo(() => calcAverage(fetchGraphDataMutation?.data), [fetchGraphDataMutation?.data]);
	const graphData = useMemo(() => {
		if (!firstEventAt) return null;
		return parseGraphData(fetchGraphDataMutation?.data, avgEventCount, interval);
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
					<AreaChartComponent
						graphData={graphData}
						avgEventCount={avgEventCount}
						setTimeRangeFromGraph={setTimeRangeFromGraph}
						hasData={graphData.length > 0}
						onZoomOrPanComplete={(start, end) => {
							setLogStore((store) => getCleanStoreForRefetch(store));
							setAppStore((store) =>
								setTimeRange(store, { type: 'custom', startTime: dayjs(start), endTime: dayjs(end) }),
							);
						}}
					/>
				) : (
					<NoDataView isError={fetchGraphDataMutation.isError} />
				)}
			</Skeleton>
		</Stack>
	);
};

export default EventTimeLineGraph;
