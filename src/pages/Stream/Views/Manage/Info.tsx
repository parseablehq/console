import { Group, Loader, Stack, Text, TextInput, Tooltip, TagsInput } from '@mantine/core';
import { ChangeEvent, useState } from 'react';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import dayjs from 'dayjs';
import { useLogStream } from '@/hooks/useLogStream';
// import { useLogsStore } from '../../providers/LogsProvider';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';

//
import styles from '../../../../pages/Home/styles/CreateStreamModal.module.css';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Info</Text>
		</Stack>
	);
};

const UpdateMaxHistoricalDifference = (props: { onClose: () => void; currentStream:string}) => {
	const [info] = useStreamStore((store) => store.info);
	const timePartitonLimit = _.get(info, 'time_partition_limit');
	const [value, setValue] = useState<number | undefined>(timePartitonLimit);
	const { updateLogStreamMutation, getLogStreamListRefetch } = useLogStream();
	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const inputTime = e.target.value
		const numberRegex = /^\d*$/;
		if(numberRegex.test(inputTime)){
		setValue(parseInt(inputTime) || 0);
		}
	};

	const updateLogStream = ( updatedValue: number) => {
			const data = {
				streamName: props.currentStream ,
				headers: {
					'x-p-update-stream': true,
					'x-p-time-partition-limit': `${updatedValue}d`,
				},
				onSuccess: getLogStreamListRefetch,
			};
			updateLogStreamMutation(data);
		
	};

	const onClick = () => {
		if (value === undefined) return;

		updateLogStream(value)
	}

	
	return (
		<Stack w={'33%'} gap={4}>
			<Text
				className={classes.fieldDescription}
				style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
				Max Historical Differernce
			</Text>
			<Stack
				gap={2}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}>
				<TextInput w={'100%'} placeholder="Max Historical Difference" value={value} onChange={(e) => onChange(e)} />
				<Stack gap={4} style={{ display: 'flex', flexDirection: 'row' }}>
					<Tooltip label="Update" withArrow position="top">
						<IconCheck
							className={classes.infoEditBtn}
							onClick={onClick}
							stroke={1.6}
							size={16}
						/>
					</Tooltip>

					<Tooltip label="Close" withArrow position="top">
						<IconX className={classes.infoEditBtn} stroke={1.6} size={16} onClick={props.onClose} />
					</Tooltip>
				</Stack>
			</Stack>
		</Stack>
	);
};

const CustomPartitionField = (props: {
	partitionFields: string[];
	// onChangeValue: (key: string, field: string[]) => void;
	isStaticSchema: boolean;
	// error: string;
	value: string[];
	onClose: () => void;
}) => {
	const shouldDisable = _.isEmpty(props.partitionFields);

	return (
		<Stack gap={0} style={{ justifyContent: 'space-between' }}>
			<Stack>
				<Text className={styles.fieldDescription}>Custom Partition Field</Text>
			</Stack>

			<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
				<TagsInput
					w={'100%'}
					placeholder={
						props.isStaticSchema
							? shouldDisable
								? 'Add Columns to the Schema'
								: 'Select column from the list'
							: 'Add upto 3 columns'
					}
					data={props.partitionFields}
					// onChange={(val) => props.onChangeValue('customPartitionFields', val)}
					maxTags={3}
					// value={props.value}
					// error={props.error}
				/>
				<Stack gap={4} style={{ display: 'flex', flexDirection: 'row' }}>
					<Tooltip label="Update" withArrow position="top">
						<IconCheck
							className={classes.infoEditBtn}
							// onClick={onClick}
							stroke={1.6}
							size={16}
						/>
					</Tooltip>

					<Tooltip label="Close" withArrow position="top">
						<IconX className={classes.infoEditBtn} stroke={1.6} size={16} onClick={props.onClose} />
					</Tooltip>
				</Stack>
			</Stack>
		</Stack>
	);
};

const InfoItem = (props: {
	title: string;
	value: string;
	fullWidth?: boolean;
	updateableValue?: string;
	editable?: boolean;
}) => {
	const [showEditField, setShowEditField] = useState<boolean>(false);
	const [value, setValue] = useState(props.updateableValue);
	const partitionFieldValues = value !== undefined ? value?.split(',') : [''];
	const [currentStream] = useAppStore((store) => store.currentStream);
	// const logsStore = useLogsStore((store) => store);
	// console.log(logsStore)
	const closeEditField = () => {
		setShowEditField(false);
	};

	


	return (
		<>
			{!showEditField ? (
				<Stack w={props.fullWidth ? '100%' : '33%'} gap={14}>
					<Group gap={6}>
						<Text
							className={classes.fieldDescription}
							style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
							{props.title}
						</Text>
						{props.editable ? (
							<Tooltip label="Edit" withArrow position="top">
								<IconEdit
									className={classes.infoEditBtn}
									stroke={1.6}
									size={12}
									onClick={() => setShowEditField(true)}
								/>
							</Tooltip>
						) : null}
					</Group>
					<Text
						className={classes.fieldTitle}
						style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: 400 }}>
						{props.value}
					</Text>
				</Stack>
			) : props.title === 'Custom Partition Field' ? (
				<CustomPartitionField
					onClose={closeEditField}
					value={partitionFieldValues}
					partitionFields={partitionFieldValues}
					isStaticSchema
				/>
			) : (
				<UpdateMaxHistoricalDifference onClose={closeEditField} currentStream = {currentStream ? currentStream : ""} />
			)}
		</>
	);
};

const InfoData = (props: { isLoading: boolean }) => {
	const [info] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);

	const updateableMaxHistoricalDiff = _.get(info, 'time_partition_limit');
	const updateableCustomPartition = _.get(info, 'custom_partition');

	const createdAt = _.chain(info)
		.get('created-at', '')
		.thru((val) => (val !== '' ? dayjs(val).format('HH:mm A DD MMM YYYY') : '-'))
		.value();
	const firstEventAt = _.chain(info)
		.get('first-event-at', '')
		.thru((val) => (val !== '' ? dayjs(val).format('HH:mm A DD MMM YYYY') : '-'))
		.value();
	const timePartition = _.get(info, 'time_partition', '-');
	const staticSchemaFlag = _.chain(info)
		.get('static_schema_flag', '')
		.thru((val) => (val === 'true' ? 'Static' : 'Dynamic'))
		.value();
	const timePartitionLimit = _.chain(info)
		.get('time_partition_limit', '')
		.thru((val) => (val === '' ? '-' : `${val} day(s)`))
		.value();
	const customPartition = _.chain(info)
		.get('custom_partition', '')
		.thru((val) => (val === '' ? '-' : _.chain(val).split(',').join(', ').value()))
		.value();

	return (
		<Stack style={{ flex: 1, padding: '1.5rem', justifyContent: 'space-between' }}>
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
						<InfoItem
							title="Max Historical Difference"
							value={timePartitionLimit}
							updateableValue={updateableMaxHistoricalDiff}
							editable
						/>
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem
							title="Custom Partition Field"
							value={customPartition}
							updateableValue={updateableCustomPartition}
							editable
							fullWidth
						/>
					</Stack>
				</>
			)}
		</Stack>
	);
};

const Info = (props: { isLoading: boolean }) => {
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<Header />
			<InfoData isLoading={props.isLoading} />
		</Stack>
	);
};

export default Info;
