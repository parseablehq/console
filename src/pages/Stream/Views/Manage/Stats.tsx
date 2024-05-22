import { Stack, Text } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { calcCompressionRate, sanitizeBytes, sanitizeEventsCount } from '@/utils/formatBytes';
import { IconArrowDown } from '@tabler/icons-react';

const Header = (props) => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Stats</Text>
		</Stack>
	);
};

const titleWidth = '37%';
const bigNoWidth = '21%';

const StatsTableHeaderRow = () => {
	return (
		<Stack style={{ flexDirection: 'row'}}>
			<Stack w={titleWidth} />
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.description}>
					Active
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.description}>
					Lifetime
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.description}>
					Deleted
				</Text>
			</Stack>
		</Stack>
	);
};

const defaultEventCountData = {
	count: '-',
	lifetime_count: '-',
	deleted_count: '-',
};

const EventsCountRow = () => {
	const [stats] = useStreamStore((store) => store.stats);
	const eventsData = _.chain(stats)
		.get('ingestion', {})
		.thru((e: {}) => ({ ...defaultEventCountData, ...e }))
		.value();

	return (
		<Stack style={{ flexDirection: 'row', borderBottom: '1px solid #dee2e6', flex: 1, alignItems: 'center' }}>
			<Stack w={titleWidth}>
				<Text className={classes.fieldTitle}>Total Events</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeEventsCount(eventsData.count)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeEventsCount(eventsData.lifetime_count)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeEventsCount(eventsData.deleted_count)}
				</Text>
			</Stack>
		</Stack>
	);
};

const defaultIngestedSizeData = {
	size: '-',
	lifetime_size: '-',
	deleted_size: '-',
};

const IngestedSizeRow = () => {
	const [stats] = useStreamStore((store) => store.stats);
	console.log(stats, 'stats');
	const ingestionData = _.chain(stats)
		.get('ingestion', {})
		.thru((e: {}) => ({ ...defaultIngestedSizeData, ...e }))
		.value();

	return (
		<Stack style={{ flexDirection: 'row', borderBottom: '1px solid #dee2e6', flex: 1, alignItems: 'center' }}>
			<Stack w={titleWidth}>
				<Text className={classes.fieldTitle}>Ingested Size</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeBytes(ingestionData.size)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeBytes(ingestionData.lifetime_size)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeBytes(ingestionData.deleted_size)}
				</Text>
			</Stack>
		</Stack>
	);
};

const defaultStorageData = {
	size: '-',
	lifetime_size: '-',
	deleted_size: '-',
};

const StorageSizeRow = () => {
	const [stats] = useStreamStore((store) => store.stats);
	console.log(stats, 'stats');
	const storageData = _.chain(stats)
		.get('storage', {})
		.thru((e: {}) => ({ ...defaultStorageData, ...e }))
		.value();
	const ingestionData = _.chain(stats)
		.get('ingestion', {})
		.thru((e: {}) => ({ ...defaultIngestedSizeData, ...e }))
		.value();
	const compressionSize = calcCompressionRate(storageData.size, ingestionData.size);
	const lifetimeCompressionSize = calcCompressionRate(storageData.lifetime_size, ingestionData.lifetime_size);
	return (
		<Stack style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
			<Stack w={titleWidth}>
				<Text className={classes.fieldTitle}>Storage Size</Text>
			</Stack>
			<Stack w={bigNoWidth} gap={0}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeBytes(storageData.size)}
				</Text>
				<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
					<Text ta="center" className={classes.compressionText}>
						{compressionSize}
					</Text>
					<IconArrowDown className={classes.compressionText} size="1.3rem" />
				</Stack>
			</Stack>
			<Stack w={bigNoWidth} gap={0}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeBytes(storageData.lifetime_size)}
				</Text>
				<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
					<Text ta="center" className={classes.compressionText}>
						{storageData.lifetime_size === '-' ? '0%' : lifetimeCompressionSize}
					</Text>
					<IconArrowDown className={classes.compressionText} size="1.3rem" />
				</Stack>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{sanitizeBytes(storageData.deleted_size)}
				</Text>
				{/* <Text ta="center">{deletedCompressionSize}</Text> */}
			</Stack>
		</Stack>
	);
};

const StatsTable = () => {
	return (
		<Stack className={classes.statsTableContainer} gap={0}>
			<StatsTableHeaderRow />
			<EventsCountRow />
			<IngestedSizeRow />
			<StorageSizeRow />
		</Stack>
	);
};

const Stats = () => {
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<Header />
			<StatsTable />
		</Stack>
	);
};

export default Stats;
