import { Stack, Text, Paper } from '@mantine/core';
import classes from './styles/Systems.module.css';
import { AreaChart, ChartTooltipProps } from '@mantine/charts';
import { IngestorQueryRecord } from '@/@types/parseable/api/clusterInfo';
import _ from 'lodash';
import { useMemo } from 'react';
import { useClusterStore } from './providers/ClusterProvider';
import { calcCompressionRate, formatBytes } from '@/utils/formatBytes';
import { IconArrowDown } from '@tabler/icons-react';
import timeRangeUtils from '@/utils/timeRangeUtils';

const { formatDateWithTimezone } = timeRangeUtils;

function ChartTooltip({ payload }: ChartTooltipProps) {
	if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

	const { size, date } = payload[0]?.payload || {};
	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{date}
			</Text>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text>Storage Used</Text>
				<Text>{formatBytes(size)}</Text>
			</Stack>
		</Paper>
	);
}

const Graph = (props: { data: { date: string; value: string }[] }) => {
	return (
		<Stack className={classes.graphContainer} h="100%">
			<AreaChart
				data={props.data}
				dataKey="date"
				series={[{ name: 'size', color: 'indigo.6' }]}
				curveType="linear"
				style={{ height: '100%' }}
				tooltipProps={{
					content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
					position: { y: -20 },
				}}
				yAxisProps={{ tickFormatter: (value) => `${formatBytes(value)}`, fontSize: '12px' }}
			/>
		</Stack>
	);
};

const StorageSizeGraph = () => {
	const [data] = useClusterStore((store) => store.currentMachineData);
	const graphData = _.reduce(
		data,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		(acc, record) => {
			const date = _.get(record, 'event_time', '');
			const localDate = new Date(`${date}Z`);
			const parsedDate = formatDateWithTimezone(localDate, 'HH:mm A z');
			const size = _.get(record, 'parseable_storage_size_data', 0);
			return [...acc, { date: parsedDate, size }];
		},
		[],
	);
	return (
		<Stack className={classes.eventCountGraph}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text className={classes.fieldTitle}>Storage Size</Text>
			</Stack>
			<Graph data={graphData} />
		</Stack>
	);
};

const OverallSection = () => {
	const [record] = useClusterStore((store) => store.currentMachineRecentRecord);
	const opts = useMemo(() => makeOverallStorageSectionProps(record), [record]);

	return (
		<Stack className={classes.overallSectionContainer}>
			<Text className={classes.fieldTitle}>Overall Storage Stats</Text>
			<Stack gap={0} style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
				<Text size="md">Used</Text>
				<Stack gap={0} style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
					<Stack gap="0.5rem" style={{ flexDirection: 'row' }}>
						<Text size="md">{`${opts.storageSize} ${'  '}`}</Text>
						<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={0}>
							<Text ta="center" size="md" className={classes.compressionText}>
								( {opts.activeCompressionRate}
							</Text>
							<IconArrowDown className={classes.compressionText} size="0.9rem" />
							<Text size="md" className={classes.compressionText}>
								)
							</Text>
						</Stack>
					</Stack>
					<Stack style={{ width: '100%', alignItems: 'flex-end' }}>
						<Text className={classes.fieldDescription}>{opts.ingestedSize} Ingested</Text>
					</Stack>
				</Stack>
			</Stack>
			<Stack gap={0} style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
				<Text size="md">Lifetime</Text>
				<Stack gap={0} style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
					<Stack gap="0.5rem" style={{ flexDirection: 'row' }}>
						<Text size="md">{`${opts.lifetimeStorageSize} ${'  '}`}</Text>
						{/* <Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={0}>
							<Text ta="center" className={classes.compressionText}>
								( {opts.activeCompressionRate}
							</Text>
							<IconArrowDown className={classes.compressionText} size="1.3rem" />)
						</Stack> */}
					</Stack>
					<Stack style={{ width: '100%', alignItems: 'flex-end' }}>
						<Text className={classes.fieldDescription}>{opts.lifetimeIngestedSize} Ingested</Text>
					</Stack>
				</Stack>
			</Stack>
			<Stack gap={0} style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
				<Text size="md">Deleted</Text>
				<Stack gap={0} style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
					<Stack gap="0.5rem" style={{ flexDirection: 'row' }}>
						<Text size="md">{`${opts.deletedStorageSize} ${'  '}`}</Text>
						{/* <Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={0}>
							<Text ta="center" className={classes.compressionText}>
								( {opts.activeCompressionRate}
							</Text>
							<IconArrowDown className={classes.compressionText} size="1.3rem" />)
						</Stack> */}
					</Stack>
					{/* <Stack style={{ width: '100%', alignItems: 'flex-end' }}>
						<Text className={classes.fieldDescription}>{opts.ingestedSize} Ingested</Text>
					</Stack> */}
				</Stack>
			</Stack>
		</Stack>
	);
};

const StorageSection = () => {
	return (
		<Stack style={{ height: '33%', flexDirection: 'row', overflow: 'hidden' }}>
			<StorageSizeGraph />
			<OverallSection />
		</Stack>
	);
};

const makeOverallStorageSectionProps = (record: IngestorQueryRecord | null) => {
	const storageSize = formatBytes(_.get(record, 'parseable_storage_size_data', 0));
	const lifetimeStorageSize = formatBytes(_.get(record, 'parseable_lifetime_storage_size_data', 0));
	const deletedStorageSize = formatBytes(_.get(record, 'parseable_deleted_storage_size_data', 0));
	const ingestedSize = formatBytes(_.get(record, 'parseable_events_ingested_size', 0));
	const lifetimeIngestedSize = formatBytes(_.get(record, 'parseable_lifetime_events_ingested_size', 0));
	const lifetimeCompressionRate = calcCompressionRate(lifetimeStorageSize, lifetimeIngestedSize);
	const activeCompressionRate = calcCompressionRate(storageSize, ingestedSize);

	return {
		storageSize,
		lifetimeIngestedSize,
		lifetimeStorageSize,
		deletedStorageSize,
		ingestedSize,
		lifetimeCompressionRate,
		activeCompressionRate,
	};
};

export default StorageSection;
