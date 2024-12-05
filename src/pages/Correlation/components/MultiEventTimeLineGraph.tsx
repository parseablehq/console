import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import classes from '../styles/Correlation.module.css';
import { useQueryResult } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChartTooltipProps, AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import _ from 'lodash';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import { filterStoreReducers, useFilterStore } from '@/pages/Stream/providers/FilterProvider';
import { useCorrelationStore } from '../providers/CorrelationProvider';

const { setTimeRange } = logsStoreReducers;
const { parseQuery } = filterStoreReducers;
const { makeTimeRangeLabel } = timeRangeUtils;

type CompactInterval = 'minute' | 'day' | 'hour' | 'quarter-hour' | 'half-hour' | 'month';

function removeOffsetFromQuery(query: string): string {
	const offsetRegex = /\sOFFSET\s+\d+/i;
	return query.replace(offsetRegex, '');
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
	return `SELECT DATE_BIN('${range}', p_timestamp, '${startTime.toISOString()}') AS date_bin_timestamp, COUNT(*) AS log_count FROM \"${streamName}\" WHERE p_timestamp BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}' AND ${whereClause} GROUP BY date_bin_timestamp ORDER BY date_bin_timestamp`;
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

// date_bin removes tz info
// filling data with empty values where there is no rec
const parseGraphData = (dataSets: (LogsResponseWithHeaders | undefined)[]) => {
	if (!dataSets || !Array.isArray(dataSets)) return [];

	const firstResponse = dataSets[0]?.records || [];
	const secondResponse = dataSets[1]?.records || [];

	// Create a map for secondResponse if it exists
	const secondResponseMap =
		secondResponse.length > 0
			? new Map(secondResponse.map((entry) => [entry.date_bin_timestamp, entry.log_count]))
			: null;

	const combinedData = firstResponse.map((firstRecord) => {
		const timestamp = firstRecord.date_bin_timestamp;

		return secondResponseMap
			? {
					stream: firstRecord.log_count,
					stream1: secondResponseMap.get(timestamp) ?? 0,
					minute: new Date(String(timestamp)).toISOString(),
			  }
			: {
					stream: firstRecord.log_count,
					minute: new Date(String(timestamp)).toISOString(),
			  };
	});

	if (secondResponseMap) {
		const uniqueSecondTimestamps = secondResponse.filter(
			(secondRecord) =>
				!firstResponse.some((firstRecord) => firstRecord.date_bin_timestamp === secondRecord.date_bin_timestamp),
		);

		uniqueSecondTimestamps.forEach((secondRecord) => {
			combinedData.push({
				stream: 0,
				stream1: Number(secondRecord.log_count),
				minute: new Date(String(secondRecord.date_bin_timestamp)).toISOString(),
			});
		});
	}

	return combinedData;
};

const MultiEventTimeLineGraph = () => {
	const { fetchQueryMutation } = useQueryResult();
	const [{ streamData }] = useCorrelationStore((store) => store);
	const [queryEngine] = useAppStore((store) => store.instanceConfig?.queryEngine);
	const [appliedQuery] = useFilterStore((store) => store.appliedQuery);
	const [{ custSearchQuery }] = useLogsStore((store) => store.custQuerySearchState);
	const [{ interval, startTime, endTime }] = useLogsStore((store) => store.timeRange);

	const [multipleStreamData, setMultipleStreamData] = useState<any>([]);

	useEffect(() => {
		if (!streamData || Object.keys(streamData).length === 0) return;

		const queries = Object.keys(streamData).map((streamKey) => {
			const { modifiedEndTime, modifiedStartTime, compactType } = getModifiedTimeRange(startTime, endTime, interval);
			const logsQuery = {
				startTime: modifiedStartTime,
				endTime: modifiedEndTime,
				access: [],
			};
			const whereClause = parseQuery(queryEngine, appliedQuery, streamKey).where;
			const query = generateCountQuery(streamKey, modifiedStartTime, modifiedEndTime, compactType, whereClause);
			const graphQuery = removeOffsetFromQuery(query);

			return {
				queryEngine: 'Parseable',
				logsQuery,
				query: graphQuery,
			};
		});

		queries.forEach((queryData: any) =>
			fetchQueryMutation.mutate(queryData, {
				onSuccess: (data) => {
					setMultipleStreamData((prevData: any) => [...prevData, data]);
				},
			}),
		);
	}, [streamData, custSearchQuery]);

	const isLoading = fetchQueryMutation.isLoading;
	const avgEventCount = useMemo(() => calcAverage(fetchQueryMutation?.data), [fetchQueryMutation?.data]);
	const graphData = useMemo(() => {
		if (!multipleStreamData || multipleStreamData.length === 0) return [];
		return parseGraphData(multipleStreamData);
	}, [multipleStreamData, avgEventCount, startTime, endTime, interval]);

	console.log(graphData);

	const hasData = Array.isArray(graphData) && graphData.length !== 0;
	const [, setLogsStore] = useLogsStore((store) => store.timeRange);
	const setTimeRangeFromGraph = useCallback((barValue: any) => {
		const activePayload = barValue?.activePayload;
		if (!Array.isArray(activePayload) || activePayload.length === 0) return;

		const currentPayload = activePayload[0];
		if (!currentPayload || typeof currentPayload !== 'object') return;

		const graphTickItem = currentPayload.payload as GraphTickItem;
		if (!graphTickItem || typeof graphTickItem !== 'object' || _.isEmpty(graphTickItem)) return;

		const { startTime, endTime } = graphTickItem;
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
						series={[
							{ name: 'stream', color: 'indigo.5', label: Object.keys(streamData)[0] },
							{ name: 'stream1', color: 'violet.5', label: Object.keys(streamData)[1] },
						]}
						// tooltipProps={{
						// 	content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
						// 	position: { y: -20 },
						// }}
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
					<NoDataView isError={fetchQueryMutation.isError} />
				)}
			</Skeleton>
		</Stack>
	);
};

export default MultiEventTimeLineGraph;
