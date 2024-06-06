import { Loader, Stack, Text } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import dayjs from 'dayjs';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Info</Text>
		</Stack>
	);
};

const InfoItem = (props: { title: string; value: string, fullWidth?: boolean }) => {
	return (
		<Stack w={props.fullWidth ? "100%" : "33%"} gap={0}>
			<Text className={classes.fieldDescription}>{props.title}</Text>
			<Text className={classes.fieldTitle}>{props.value}</Text>
		</Stack>
	);
};

const InfoData = (props: {isLoading: boolean}) => {
	const [info] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);

	const createdAt = _.chain(info).get("created-at", '').thru(val => val !== '' ? dayjs(val).format('HH:mm A DD MMM YYYY') : '-').value()
	const firstEventAt = _.chain(info).get("first-event-at", "").thru(val => val !== '' ? dayjs(val).format('HH:mm A DD MMM YYYY') : '-').value()
	const timePartition = _.get(info, 'time_partition', '-');
	const staticSchemaFlag = _.chain(info)
		.get('static_schema_flag', '')
		.thru((val) => (val === 'true' ? 'Static' : 'Dynamic'))
		.value();
	const timePartitionLimit = _.chain(info).get('time_partition_limit', '').thru(val => val === '' ? '-' : `${val} day(s)`).value()
	const customPartition = _.chain(info)
		.get('custom_partition', '')
		.thru((val) => (val === '' ? '-' : _.chain(val).split(',').join(', ').value()))
		.value();

	return (
		<Stack style={{ flex: 1, padding: '1.5rem' }} gap={20}>
			{props.isLoading ? (
				<Stack style={{ flex: 1, width: '100%', alignItems: 'centrer', justifyContent: 'center' }}>
					<Stack style={{ alignItems: 'center' }}>
						<Loader />
					</Stack>
				</Stack>
			) : (
				<>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Name" value={currentStream || ''} />
						<InfoItem title="Created At" value={createdAt} />
						<InfoItem title="First Event At" value={firstEventAt} />
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Schema Type" value={staticSchemaFlag} />
						<InfoItem title="Time Partition Field" value={timePartition} />
						<InfoItem title="Maximum Historical Difference" value={timePartitionLimit} />
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Custom Partition Field" value={customPartition} fullWidth/>
					</Stack>
				</>
			)}
		</Stack>
	);
};

const Info = (props: {isLoading: boolean}) => {
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<Header />
			<InfoData isLoading={props.isLoading}/>
		</Stack>
	);
};

export default Info;
