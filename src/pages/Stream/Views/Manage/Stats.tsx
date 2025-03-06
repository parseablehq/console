import { Loader, Stack, Text } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { calcCompressionRate, formatBytes, HumanizeNumber } from '@/utils/formatBytes';
import { IconArrowDown } from '@tabler/icons-react';
import ErrorView from './ErrorView';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Stats</Text>
		</Stack>
	);
};

const titleWidth = '28%';
const bigNoWidth = '24%';

const StatsTableHeaderRow = () => {
	return (
		<Stack style={{ flexDirection: 'row' }}>
			<Stack w={titleWidth} />
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.fieldDescription}>
					Stored
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.fieldDescription}>
					Lifetime
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.fieldDescription}>
					Deleted
				</Text>
			</Stack>
		</Stack>
	);
};

const defaultEventCountData = {
	count: 0,
	lifetime_count: 0,
	deleted_count: 0,
};

const EventsCountRow = () => {
	const [stats] = useStreamStore((store) => store.stats);
	const eventsData = _.chain(stats)
		.get('ingestion', {})
		.thru((e) => ({ ...defaultEventCountData, ...e }))
		.value();

	return (
		<Stack style={{ flexDirection: 'row', borderBottom: '1px solid #dee2e6', flex: 1, alignItems: 'center' }}>
			<Stack w={titleWidth}>
				<Text className={classes.fieldTitle}>Total Events</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{HumanizeNumber(eventsData.count)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{HumanizeNumber(eventsData.lifetime_count)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{HumanizeNumber(eventsData.deleted_count)}
				</Text>
			</Stack>
		</Stack>
	);
};

const defaultIngestedSizeData = {
	size: 0,
	lifetime_size: 0,
	deleted_size: 0,
};

const IngestedSizeRow = () => {
	const [stats] = useStreamStore((store) => store.stats);
	const ingestionData = _.chain(stats)
		.get('ingestion', {})
		.thru((e) => ({ ...defaultIngestedSizeData, ...e }))
		.value();

	return (
		<Stack style={{ flexDirection: 'row', borderBottom: '1px solid #dee2e6', flex: 1, alignItems: 'center' }}>
			<Stack w={titleWidth}>
				<Text className={classes.fieldTitle}>Ingested Size</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{formatBytes(ingestionData.size)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{formatBytes(ingestionData.lifetime_size)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{formatBytes(ingestionData.deleted_size)}
				</Text>
			</Stack>
		</Stack>
	);
};

const defaultStorageData = {
	size: 0,
	lifetime_size: 0,
	deleted_size: 0,
};

const StorageSizeRow = () => {
	const [stats] = useStreamStore((store) => store.stats);
	const storageData = _.chain(stats)
		.get('storage', {})
		.thru((e) => ({ ...defaultStorageData, ...e }))
		.value();
	const ingestionData = _.chain(stats)
		.get('ingestion', {})
		.thru((e) => ({ ...defaultIngestedSizeData, ...e }))
		.value();
	const compressionSize = calcCompressionRate(storageData.size, ingestionData.size);
	return (
		<Stack style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
			<Stack w={titleWidth}>
				<Text className={classes.fieldTitle}>Storage Size</Text>
			</Stack>
			<Stack w={bigNoWidth} gap={0} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
				<Text ta="center" className={classes.bigNoText}>
					{formatBytes(storageData.size)}
				</Text>
				<Stack
					gap={0}
					className={classes.compressionText}
					style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
					<Stack gap={0} style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Text size="md" mr="2px">{`(  `}</Text>
						<Text size="md" ta="center" className={classes.compressionText}>
							{compressionSize}
						</Text>
						<IconArrowDown className={classes.compressionText} size="0.8rem" stroke={1.8} />
						<Text size="md">)</Text>
					</Stack>
				</Stack>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{formatBytes(storageData.lifetime_size)}
				</Text>
			</Stack>
			<Stack w={bigNoWidth}>
				<Text ta="center" className={classes.bigNoText}>
					{formatBytes(storageData.deleted_size)}
				</Text>
			</Stack>
		</Stack>
	);
};

const StatsTable = (props: { isLoading: boolean }) => {
	return (
		<Stack className={classes.statsTableContainer} gap={0}>
			{props.isLoading ? (
				<Stack style={{ flex: 1, width: '100%', alignItems: 'centrer', justifyContent: 'center' }}>
					<Stack style={{ alignItems: 'center' }}>
						<Loader />
					</Stack>
				</Stack>
			) : (
				<>
					<StatsTableHeaderRow />
					<EventsCountRow />
					<IngestedSizeRow />
					<StorageSizeRow />
				</>
			)}
		</Stack>
	);
};

const Stats = (props: { isLoading: boolean; isError: boolean }) => {
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<Header />
			{!props.isError ? <StatsTable isLoading={props.isLoading} /> : <ErrorView />}
		</Stack>
	);
};

export default Stats;
