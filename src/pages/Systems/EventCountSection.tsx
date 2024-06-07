import { Stack, Text, Paper } from '@mantine/core';
import classes from './styles/Systems.module.css';
import { AreaChart, ChartTooltipProps } from '@mantine/charts';
import { IngestorQueryRecord } from '@/@types/parseable/api/clusterInfo';
import _ from 'lodash';
import { useMemo } from 'react';
import { useClusterStore } from './providers/ClusterProvider';
import { sanitizeEventsCount } from '@/utils/formatBytes';
import dayjs from 'dayjs';

function ChartTooltip({ payload }: ChartTooltipProps) {
	if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

	const { count, date } = payload[0]?.payload || {};
	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{date}
			</Text>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text>Total Events</Text>
				<Text>{sanitizeEventsCount(count)}</Text>
			</Stack>
		</Paper>
	);
}

const EventsGraph = (props: { data: { date: string; value: string }[] }) => {
	return (
		<Stack className={classes.graphContainer} h="100%">
			<AreaChart
				data={props.data}
				dataKey="date"
				series={[{ name: 'count', color: 'indigo.6' }]}
				curveType="linear"
				style={{ height: '100%' }}
				tooltipProps={{
					content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
					position: { y: -20 },
				}}
				yAxisProps={{ tickFormatter: (value) => `${sanitizeEventsCount(value)}`, fontSize: '18px'}}
			/>
		</Stack>
	);
};

const EventsCountGraph = () => {
	const [data] = useClusterStore((store) => store.currentMachineData);
	const graphData = _.reduce(
		data,
		// @ts-ignore
		(acc, record) => {
			const date = _.get(record, 'event_time', '');
			const localDate = new Date(`${date}Z`);
			const parsedDate = dayjs(localDate).format('HH:mm A')
			const count = _.get(record, 'parseable_events_ingested', 0);
			return [...acc, { date: parsedDate, count }];
		},
		[],
	);
	return (
		<Stack className={classes.eventCountGraph}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text className={classes.fieldTitle}>Events Ingested</Text>
			</Stack>
			<EventsGraph data={graphData} />
		</Stack>
	);
};

const EventsCountOverallSection = () => {
	const [record] = useClusterStore((store) => store.currentMachineRecentRecord);
	const opts = useMemo(() => makeOverallEventSectionProps(record), [record]);
	return (
		<Stack className={classes.overallSectionContainer}>
			<Text className={classes.fieldTitle}>Overall Events Stats</Text>
			<Stack gap={0} style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
				<Text size="md">Total</Text>
				<Text size="md">{opts.totalEvents}</Text>
			</Stack>
			<Stack gap={0} style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
				<Text size="md">Lifetime</Text>
				<Text size="md">{opts.lifetimeEvents}</Text>
			</Stack>
			<Stack gap={0} style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
				<Text size="md">Deleted</Text>
				<Text size="md">{opts.deletedEvents}</Text>
			</Stack>
		</Stack>
	);
};

const EventsCountSection = () => {
	return (
		<Stack style={{ height: '33%', flexDirection: 'row', overflow: 'hidden' }}>
			<EventsCountGraph />
			<EventsCountOverallSection />
		</Stack>
	);
};

const makeOverallEventSectionProps = (record: IngestorQueryRecord | null) => {
	const opts = {
		totalEvents: '0',
		lifetimeEvents: '0',
		deletedEvents: '0',
	};
	if (!record) {
		return opts;
	} else {
		opts.totalEvents = sanitizeEventsCount(_.get(record, 'parseable_events_ingested', 0));
		opts.lifetimeEvents = sanitizeEventsCount(_.get(record, 'parseable_lifetime_events_ingested', 0));
		opts.deletedEvents = sanitizeEventsCount(_.get(record, 'parseable_deleted_events_ingested', 0));
		return opts;
	}
};

export default EventsCountSection;