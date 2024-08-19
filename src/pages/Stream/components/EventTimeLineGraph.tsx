import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import classes from '../styles/EventTimeLineGraph.module.css';
import { useQueryResult } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChartTooltipProps, AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';
import { logsStoreReducers, useLogsStore } from '../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useFilterStore, filterStoreReducers } from '../providers/FilterProvider';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import _ from 'lodash';
const { setTimeRange } = logsStoreReducers;

const { parseQuery } = filterStoreReducers;

type CompactInterval = 'minute' | 'day' | 'hour' | 'quarter-hour' | 'half-hour' | 'month';

function extractWhereClause(sql: string) {
	const whereClauseRegex = /WHERE\s+(.*?)(?=\s*(ORDER\s+BY|GROUP\s+BY|LIMIT|$))/i;
	const match = sql.match(whereClauseRegex);
	if (match) {
		return match[1].trim();
	}
	return '(1 = 1)';
}

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

const getStartOfTs = (time: Date, compactType: CompactInterval): Date => {
	if (compactType === 'minute') {
		return time;
	} else if (compactType === 'hour') {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours());
	} else if (compactType === 'quarter-hour') {
		const roundOff = 1000 * 60 * 15;
		return new Date(Math.floor(time.getTime() / roundOff) * roundOff);
	} else if (compactType === 'half-hour') {
		const roundOff = 1000 * 60 * 30;
		return new Date(Math.floor(time.getTime() / roundOff) * roundOff);
	} else if (compactType === 'day') {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate());
	} else {
		return new Date(time.getFullYear(), time.getMonth());
	}
};

const getEndOfTs = (time: Date, compactType: CompactInterval): Date => {
	if (compactType === 'minute') {
		return time;
	} else if (compactType === 'hour') {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours() + 1);
	} else if (compactType === 'quarter-hour') {
		const roundOff = 1000 * 60 * 15;
		return new Date(Math.round(time.getTime() / roundOff) * roundOff);
	} else if (compactType === 'half-hour') {
		const roundOff = 1000 * 60 * 30;
		return new Date(Math.round(time.getTime() / roundOff) * roundOff);
	} else if (compactType === 'day') {
		return new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1);
	} else {
		return new Date(time.getFullYear(), time.getMonth() + 1);
	}
};

const getAllIntervals = (start: Date, end: Date, compactType: CompactInterval): Date[] => {
	const result = [];
	const current = new Date(start);

	const increment = (date: Date, type: CompactInterval) => {
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
			case 'quarter-hour':
				date.setMinutes(date.getMinutes() + 15);
				break;
			case 'half-hour':
				date.setMinutes(date.getMinutes() + 30);
				break;
			case 'month':
				date.setMonth(date.getMonth() + 1);
				break;
		}
	};

	while (current <= end) {
		result.push(new Date(current));
		increment(current, compactType);
	}

	return result;
};

const getModifiedTimeRange = (
	startTime: Date,
	endTime: Date,
	interval: number,
): { modifiedStartTime: Date; modifiedEndTime: Date; compactType: CompactInterval } => {
	const compactType = getCompactType(interval);
	const modifiedStartTime = getStartOfTs(startTime, compactType);
	const modifiedEndTime = getEndOfTs(endTime, compactType);
	return { modifiedEndTime, modifiedStartTime, compactType };
};

const compactTypeIntervalMap = {
	minute: '1 minute',
	hour: '1 hour',
	day: '24 hour',
	'quarter-hour': '15 minute',
	'half-hour': '30 minute',
	month: '1 month',
};

const generateCountQuery = (
	streamName: string,
	startTime: Date,
	endTime: Date,
	compactType: CompactInterval,
	whereClause: string,
) => {
	const range = compactTypeIntervalMap[compactType];
	return `SELECT DATE_BIN('${range}', p_timestamp, '${startTime.toISOString()}') AS date_bin_timestamp, COUNT(*) AS log_count FROM ${streamName} WHERE p_timestamp BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}' AND ${whereClause} GROUP BY date_bin_timestamp ORDER BY date_bin_timestamp`;
};

const NoDataView = () => {
	return (
		<Stack style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Stack className={classes.noDataContainer}>
				<Text className={classes.noDataText}>No new events in the selected time range.</Text>
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

// date_bin removes tz info
// filling data with empty values where there is no rec
const parseGraphData = (
	data: LogsResponseWithHeaders | undefined,
	avg: number,
	startTime: Date,
	endTime: Date,
	interval: number,
) => {
	if (!data || !Array.isArray(data?.records)) return [];

	const { fields, records } = data;
	if (_.isEmpty(records) || !_.includes(fields, 'log_count') || !_.includes(fields, 'date_bin_timestamp')) return [];

	const { modifiedEndTime, modifiedStartTime, compactType } = getModifiedTimeRange(startTime, endTime, interval);
	const allTimestamps = getAllIntervals(modifiedStartTime, modifiedEndTime, compactType);
	const parsedData = allTimestamps.map((ts) => {
		const countData = records.find((d) => {
			return new Date(`${d.date_bin_timestamp}Z`).toISOString() === ts.toISOString();
		});

		if (!countData || typeof countData !== 'object') {
			return {
				events: 0,
				minute: ts,
				aboveAvgPercent: 0,
				compactType,
			};
		} else {
			const aboveAvgCount = _.toNumber(countData.log_count) - avg;
			const aboveAvgPercent = parseInt(((aboveAvgCount / avg) * 100).toFixed(2));
			return {
				events: countData.log_count,
				minute: ts,
				aboveAvgPercent,
				compactType,
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
	const endTime = (() => {
		if (compactType === 'half-hour') {
			return dayjs(minute).add(30, 'minute');
		} else if (compactType === 'quarter-hour') {
			return dayjs(minute).add(15, 'minute');
		} else {
			return dayjs(minute).add(1, compactType);
		}
	})();

	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{`${startTime.format('DD MMM YY hh:mm A')} - ${endTime.format('DD MMM YY hh:mm A')}`}
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
	const [appliedQuery] = useFilterStore((store) => store.appliedQuery);
	const [{ activeMode, custSearchQuery }] = useLogsStore((store) => store.custQuerySearchState);
	const [{ interval, startTime, endTime }] = useLogsStore((store) => store.timeRange);

	useEffect(() => {
		if (!currentStream || currentStream.length === 0) return;
		const { modifiedEndTime, modifiedStartTime, compactType } = getModifiedTimeRange(startTime, endTime, interval);

		const logsQuery = {
			streamName: currentStream,
			startTime: modifiedStartTime,
			endTime: modifiedEndTime,
			access: [],
		};

		const whereClause =
			activeMode === 'sql' ? extractWhereClause(custSearchQuery) : parseQuery(appliedQuery, currentStream).where;
		const query = generateCountQuery(currentStream, modifiedStartTime, modifiedEndTime, compactType, whereClause);
		fetchQueryMutation.mutate({
			logsQuery,
			query,
		});
	}, [currentStream, startTime.toISOString(), endTime.toISOString(), custSearchQuery]);

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
		setLogsStore((store) => setTimeRange(store, { type: 'custom', startTime: startTime, endTime: endTime }));
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
					<NoDataView />
				)}
			</Skeleton>
		</Stack>
	);
};

export default EventTimeLineGraph;
