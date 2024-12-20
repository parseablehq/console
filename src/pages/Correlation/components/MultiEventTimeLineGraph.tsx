import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import classes from '../styles/Correlation.module.css';
import { useQueryResult } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import _ from 'lodash';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { filterStoreReducers, useFilterStore } from '@/pages/Stream/providers/FilterProvider';
import { useCorrelationStore } from '../providers/CorrelationProvider';

const { parseQuery } = filterStoreReducers;
const { makeTimeRangeLabel } = timeRangeUtils;
const { setTimeRange } = appStoreReducers;

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
	/* eslint-disable no-useless-escape */
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

const getAllIntervals = (start: Date, end: Date, compactType: CompactInterval): Date[] => {
	const result = [];
	let currentDate = new Date(start);

	while (currentDate <= end) {
		result.push(new Date(currentDate));
		currentDate = incrementDateByCompactType(currentDate, compactType);
	}

	return result;
};

const incrementDateByCompactType = (date: Date, type: CompactInterval): Date => {
	const tempDate = new Date(date);
	if (type === 'minute') {
		tempDate.setMinutes(tempDate.getMinutes() + 1);
	} else if (type === 'hour') {
		tempDate.setHours(tempDate.getHours() + 1);
	} else if (type === 'day') {
		tempDate.setDate(tempDate.getDate() + 1);
	} else if (type === 'quarter-hour') {
		tempDate.setMinutes(tempDate.getMinutes() + 15);
	} else if (type === 'half-hour') {
		tempDate.setMinutes(tempDate.getMinutes() + 30);
	} else if (type === 'month') {
		tempDate.setMonth(tempDate.getMonth() + 1);
	} else {
		tempDate;
	}
	return new Date(tempDate);
};

type GraphTickItem = {
	events: number;
	minute: Date;
	aboveAvgPercent: number;
	compactType: CompactInterval;
	startTime: dayjs.Dayjs;
	endTime: dayjs.Dayjs;
};

interface ChartTooltipProps {
	payload?: {
		name: string;
		value: number;
		color: string;
		payload: {
			startTime: dayjs.Dayjs;
			endTime: dayjs.Dayjs;
		};
	}[];
	series: { name: string; label: string }[];
}

function ChartTooltip({ payload, series }: ChartTooltipProps) {
	if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

	const { startTime, endTime } = payload[0].payload;

	// Convert Dayjs to Date
	const label = makeTimeRangeLabel(startTime.toDate(), endTime.toDate());

	// Map payload data to corresponding series labels
	const data = series
		.map((seriesItem) => {
			const matchingPayload = payload.find((item) => item.name === seriesItem.name);
			return matchingPayload
				? {
						label: seriesItem.label,
						value: matchingPayload.value,
						color: matchingPayload.color,
				  }
				: null;
		})
		.filter((item): item is { label: string; value: number; color: string } => item !== null);

	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{label}
			</Text>
			<Stack>
				{data.map(({ label, value, color }, index) => (
					<Stack
						key={index}
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
						<div
							style={{
								width: 12,
								height: 12,
								backgroundColor: color,
								borderRadius: '50%',
								marginRight: 8,
							}}></div>
						<Text style={{ flex: 1 }}>{label}</Text>
						<Text>{value}</Text>
					</Stack>
				))}
			</Stack>
		</Paper>
	);
}

// date_bin removes tz info
// filling data with empty values where there is no rec
const parseGraphData = (
	dataSets: (LogsResponseWithHeaders | undefined)[],
	startTime: Date,
	endTime: Date,
	interval: number,
) => {
	if (!dataSets || !Array.isArray(dataSets)) return [];

	const firstResponse = dataSets[0]?.records || [];
	const secondResponse = dataSets[1]?.records || [];

	const { modifiedEndTime, modifiedStartTime, compactType } = getModifiedTimeRange(startTime, endTime, interval);
	const allTimestamps = getAllIntervals(modifiedStartTime, modifiedEndTime, compactType);

	const hasSecondDataset = dataSets[1] !== undefined;

	const secondResponseMap =
		secondResponse.length > 0
			? new Map(
					secondResponse.map((entry) => [new Date(`${entry.date_bin_timestamp}Z`).toISOString(), entry.log_count]),
			  )
			: new Map();
	const calculateTimeRange = (timestamp: Date | string) => {
		const startTime = dayjs(timestamp);
		const endTimeByCompactType = incrementDateByCompactType(startTime.toDate(), compactType);
		const endTime = dayjs(endTimeByCompactType);
		return { startTime, endTime };
	};
	const combinedData = allTimestamps.map((ts) => {
		const firstRecord = firstResponse.find((record) => {
			const recordTimestamp = new Date(`${record.date_bin_timestamp}Z`).toISOString();
			const tsISO = ts.toISOString();
			return recordTimestamp === tsISO;
		});

		const secondCount = secondResponseMap?.get(ts.toISOString()) ?? 0;
		const { startTime, endTime } = calculateTimeRange(ts);

		const defaultOpts: Record<string, any> = {
			stream: firstRecord?.log_count || 0,
			minute: ts,
			compactType,
			startTime,
			endTime,
		};

		if (hasSecondDataset) {
			defaultOpts.stream1 = secondCount;
		}

		return defaultOpts;
	});

	return combinedData;
};

const MultiEventTimeLineGraph = () => {
	const { fetchQueryMutation } = useQueryResult();
	const [fields] = useCorrelationStore((store) => store.fields);
	const [queryEngine] = useAppStore((store) => store.instanceConfig?.queryEngine);
	const [appliedQuery] = useFilterStore((store) => store.appliedQuery);
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [multipleStreamData, setMultipleStreamData] = useState<any>([]);

	const { interval, startTime, endTime } = timeRange;

	useEffect(() => {
		if (!fields || Object.keys(fields).length === 0) {
			setMultipleStreamData([]);
			return;
		}
		const queries = Object.keys(fields).map((streamKey) => {
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
		setMultipleStreamData([]);
		Promise.all(queries.map((queryData: any) => fetchQueryMutation.mutateAsync(queryData)))
			.then((results) => {
				setMultipleStreamData(results);
			})
			.catch((error) => {
				console.error('Error fetching queries:', error);
			});
	}, [fields, timeRange]);

	const isLoading = fetchQueryMutation.isLoading;
	const avgEventCount = useMemo(() => calcAverage(fetchQueryMutation?.data), [fetchQueryMutation?.data]);
	const graphData = useMemo(() => {
		if (
			!multipleStreamData ||
			multipleStreamData.length === 0 ||
			multipleStreamData.length !== Object.keys(fields).length
		)
			return [];
		return parseGraphData(multipleStreamData, startTime, endTime, interval);
	}, [multipleStreamData]);

	const hasData = Array.isArray(graphData) && graphData.length !== 0;
	const [, setLogsStore] = useAppStore((store) => store.timeRange);
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
							{ name: 'stream', color: 'indigo.5', label: Object.keys(fields)[0] },
							{ name: 'stream1', color: 'violet.5', label: Object.keys(fields)[1] },
						]}
						tooltipProps={{
							content: ({ payload }: any) => (
								<ChartTooltip
									payload={payload}
									series={[
										{ name: 'stream', label: Object.keys(fields)[0] },
										{ name: 'stream1', label: Object.keys(fields)[1] },
									]}
								/>
							),
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
					<NoDataView isError={fetchQueryMutation.isError} />
				)}
			</Skeleton>
		</Stack>
	);
};

export default MultiEventTimeLineGraph;
