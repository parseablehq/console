import { Group, Loader, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { ChangeEvent, useState } from 'react';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import dayjs from 'dayjs';
import { useLogStream } from '@/hooks/useLogStream';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Info</Text>
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
	const [value, setValue] = useState<string>(props.updateableValue || '');
	const placeHolderText = `Enter a value for ${props.title}`;
	const editFieldWidth = props.title === 'Custom Partition Field' ? '50%' : '100%';
	const { updateLogStreamMutation, getLogStreamListRefetch } = useLogStream();
	const [currentStream] = useAppStore((store) => store.currentStream);

	const updateLogStream = (fieldName: string, updatedValue: number) => {
		if (fieldName === 'maxHist') {
			const data = {
				streamName: currentStream || '',
				headers: {
					'x-p-update-stream': true,
					'x-p-time-partition-limit': `${updatedValue}d`,
				},
				onSuccess: getLogStreamListRefetch,
			};
			updateLogStreamMutation(data);
		}
	};

	const onClick = () => {
		updateLogStream('maxHist', 10);
	};

	const updateValue = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
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
			) : (
				<Stack w={props.fullWidth ? '100%' : '33%'} gap={4}>
					<Text
						className={classes.fieldDescription}
						style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
						{props.title}
					</Text>
					<Stack
						gap={2}
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							width: editFieldWidth,
						}}>
						<TextInput w={'100%'} placeholder={placeHolderText} value={value} onChange={(e) => updateValue(e)} />
						<Stack gap={4} style={{ display: 'flex', flexDirection: 'row' }}>
							<Tooltip label="Update" withArrow position="top">
								<IconCheck className={classes.infoEditBtn} onClick={onClick} stroke={1.6} size={16} />
							</Tooltip>

							<Tooltip label="Close" withArrow position="top">
								<IconX className={classes.infoEditBtn} stroke={1.6} size={16} onClick={() => setShowEditField(false)} />
							</Tooltip>
						</Stack>
					</Stack>
				</Stack>
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
