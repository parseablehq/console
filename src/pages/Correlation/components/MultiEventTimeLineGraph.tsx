import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import classes from '../styles/Correlation.module.css';
import { useGraphData } from '@/hooks/useQueryResult';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { AreaChart } from '@mantine/charts';
import { HumanizeNumber } from '@/utils/formatBytes';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import _ from 'lodash';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { useCorrelationStore } from '../providers/CorrelationProvider';

const { makeTimeRangeLabel } = timeRangeUtils;
const { setTimeRange } = appStoreReducers;

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

type LogRecord = {
	date_bin_timestamp: string;
	log_count: number;
};

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

	const compactType = getCompactType(interval);
	const ticksCount = interval < 10 * 60 * 1000 ? interval / (60 * 1000) : interval < 60 * 60 * 1000 ? 10 : 60;
	const intervalDuration = (endTime.getTime() - startTime.getTime()) / ticksCount;

	const allTimestamps = Array.from(
		{ length: ticksCount },
		(_, index) => new Date(startTime.getTime() + index * intervalDuration),
	);

	const hasSecondDataset = dataSets[1] !== undefined;

	const isValidRecord = (record: any): record is LogRecord => {
		return typeof record.date_bin_timestamp === 'string' && typeof record.log_count === 'number';
	};

	const secondResponseMap =
		secondResponse.length > 0
			? new Map(
					secondResponse
						.filter((entry) => isValidRecord(entry))
						.map((entry) => {
							const timestamp = entry.date_bin_timestamp;
							if (timestamp != null) {
								return [new Date(timestamp).getTime(), entry.log_count];
							}
							return null;
						})
						.filter((entry): entry is [number, number] => entry !== null),
			  )
			: new Map();

	const combinedData = allTimestamps.map((ts) => {
		const firstRecord = firstResponse.find((record) => {
			if (!isValidRecord(record)) return false;
			const recordTimestamp = new Date(record.date_bin_timestamp).getTime();
			const tsISO = ts.getTime();
			return recordTimestamp === tsISO;
		});

		const secondCount = secondResponseMap?.get(ts.toISOString()) ?? 0;

		const defaultOpts: Record<string, any> = {
			stream: firstRecord?.log_count || 0,
			minute: ts,
			compactType,
			startTime: dayjs(ts),
			endTime: dayjs(new Date(ts.getTime() + intervalDuration)),
		};

		if (hasSecondDataset) {
			defaultOpts.stream1 = secondCount;
		}

		return defaultOpts;
	});

	return combinedData;
};

const MultiEventTimeLineGraph = () => {
	const { fetchGraphDataMutation } = useGraphData();
	const [fields] = useCorrelationStore((store) => store.fields);
	const [streamData] = useCorrelationStore((store) => store.streamData);
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [multipleStreamData, setMultipleStreamData] = useState<{ [key: string]: any }>({});

	const { interval, startTime, endTime } = timeRange;

	const streamGraphData = Object.values(multipleStreamData);

	useEffect(() => {
		setMultipleStreamData((prevData) => {
			const newData = { ...prevData };
			const streamDataKeys = Object.keys(streamData);
			Object.keys(newData).forEach((key) => {
				if (!streamDataKeys.includes(key)) {
					delete newData[key];
				}
			});
			return newData;
		});
	}, [streamData]);

	useEffect(() => {
		if (!fields || Object.keys(fields).length === 0) {
			setMultipleStreamData({});
			return;
		}

		const streamNames = Object.keys(fields);
		const streamsToFetch = streamNames.filter((streamName) => !Object.keys(streamData).includes(streamName));
		const totalMinutes = interval / (1000 * 60);
		const numBins = totalMinutes < 10 ? totalMinutes : totalMinutes < 60 ? 10 : 60;
		const queries = streamsToFetch.map((streamKey) => {
			const logsQuery = {
				stream: streamKey,
				startTime: dayjs(startTime).toISOString(),
				endTime: dayjs(endTime).add(1, 'minute').toISOString(),
				numBins,
			};
			return logsQuery;
		});
		Promise.all(queries.map((queryData: any) => fetchGraphDataMutation.mutateAsync(queryData)))
			.then((results) => {
				setMultipleStreamData((prevData: any) => {
					const newData = { ...prevData };
					results.forEach((result, index) => {
						newData[queries[index].stream] = result;
					});
					return newData;
				});
			})
			.catch((error) => {
				console.error('Error fetching queries:', error);
			});
	}, [fields, timeRange]);

	const isLoading = fetchGraphDataMutation.isLoading;
	const avgEventCount = useMemo(() => calcAverage(fetchGraphDataMutation?.data), [fetchGraphDataMutation?.data]);
	const graphData = useMemo(() => {
		if (!streamGraphData || streamGraphData.length === 0 || streamGraphData.length !== Object.keys(fields).length)
			return [];
		return parseGraphData(streamGraphData, startTime, endTime, interval);
	}, [streamGraphData]);

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
					<NoDataView isError={fetchGraphDataMutation.isError} />
				)}
			</Skeleton>
		</Stack>
	);
};

export default MultiEventTimeLineGraph;
