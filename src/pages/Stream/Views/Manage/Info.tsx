import { Group, Loader, Stack, Text } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import timeRangeUtils from '@/utils/timeRangeUtils';
import ErrorView from './ErrorView';
import PartitionLimit from './PartitionLimit';

const { formatDateWithTimezone } = timeRangeUtils;

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Info</Text>
		</Stack>
	);
};

const InfoItem = (props: { title: string; value: string; fullWidth?: boolean }) => {
	return (
		<Stack w={props.fullWidth ? '100%' : '33%'} gap={1} style={{ height: '3.5rem' }}>
			<Group gap={6}>
				<Text
					className={classes.fieldDescription}
					style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
					{props.title}
				</Text>
			</Group>

			<Text
				className={classes.fieldTitle}
				style={{
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					fontWeight: 400,
				}}>
				{props.value}
			</Text>
		</Stack>
	);
};

const InfoData = (props: { isLoading: boolean }) => {
	const [info] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);

	const createdAt = _.get(info, 'created-at');
	const firstEventAt = _.get(info, 'first-event-at');
	const createdAtWithTz = createdAt ? formatDateWithTimezone(createdAt) : '-';
	const firstEventAtWithTz = firstEventAt ? formatDateWithTimezone(firstEventAt) : '-';

	const timePartition = _.get(info, 'time_partition', '-');
	const staticSchemaFlag = _.chain(info)
		.get('static_schema_flag', '')
		.thru((val) => (val === 'true' ? 'Static' : 'Dynamic'))
		.value();

	return (
		<Stack style={{ flex: 1 }}>
			{props.isLoading ? (
				<Stack style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
					<Stack style={{ alignItems: 'center' }}>
						<Loader />
					</Stack>
				</Stack>
			) : (
				<Stack style={{ flex: 1, padding: '1.5rem', justifyContent: 'space-between' }}>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Name" value={currentStream || ''} />
						<InfoItem title="Created At" value={createdAtWithTz} />
						<InfoItem title="First Event At" value={firstEventAtWithTz} />
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Schema Type" value={staticSchemaFlag} />
						<InfoItem title="Time Partition Field" value={timePartition} />
						<PartitionLimit currentStream={currentStream ? currentStream : ''} timePartition={timePartition} />
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<PartitionLimit currentStream={currentStream ? currentStream : ''} timePartition={timePartition} />
					</Stack>
				</Stack>
			)}
		</Stack>
	);
};

const Info = (props: { isLoading: boolean; isError: boolean }) => {
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<Header />
			{props.isError ? <ErrorView /> : <InfoData isLoading={props.isLoading} />}
		</Stack>
	);
};

export default Info;
