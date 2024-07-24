import { Group, Loader, Stack, Text, TextInput, Tooltip, TagsInput, Box } from '@mantine/core';
import { ChangeEvent, useCallback, useState } from 'react';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import dayjs from 'dayjs';
import { useLogStream } from '@/hooks/useLogStream';
import { useGetStreamInfo } from '@/hooks/useGetStreamInfo';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Info</Text>
		</Stack>
	);
};

const UpdateFieldButtons = (props: { onClose: () => void; onUpdateClick: () => void; isUpdating: boolean }) => {
	return (
		<Box>
			{!props.isUpdating ? (
				<Stack gap={4} style={{ display: 'flex', flexDirection: 'row' }}>
					<Tooltip label="Update" withArrow position="top">
						<IconCheck className={classes.infoEditBtn} onClick={() => props.onUpdateClick()} stroke={1.6} size={16} />
					</Tooltip>

					<Tooltip label="Close" withArrow position="top">
						<IconX className={classes.infoEditBtn} stroke={1.6} size={16} onClick={() => props.onClose()} />
					</Tooltip>
				</Stack>
			) : (
				<Loader variant="ring" size="sm" style={{ padding: '0 0.2rem' }} />
			)}
		</Box>
	);
};

const UpdateMaxHistoricalDifference = (props: { onClose: () => void; currentStream: string }) => {
	const [info] = useStreamStore((store) => store.info);
	const timePartitonLimit = _.get(info, 'time_partition_limit');
	const [value, setValue] = useState<number | undefined>(timePartitonLimit);
	const [updating, setUpdating] = useState<boolean>(false);
	const { updateLogStreamMutation } = useLogStream();
	const { getStreamInfoRefetch } = useGetStreamInfo(props.currentStream);

	const onChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const inputTime = e.target.value;
			const numberRegex = /^\d*$/;
			if (numberRegex.test(inputTime)) {
				setValue(parseInt(inputTime) || 0);
			}
		},
		[setValue],
	);

	const updateLogStreamSuccess = useCallback(() => {
		props.onClose();
		setUpdating(false);
		getStreamInfoRefetch();
	}, [getStreamInfoRefetch]);

	const updateLogStream = useCallback(
		(updatedValue: number) => {
			updateLogStreamMutation({
				streamName: props.currentStream,
				header: { 'x-p-time-partition-limit': `${updatedValue}d` },
				onSuccess: updateLogStreamSuccess,
				onError: () => setUpdating(false),
			});
		},
		[updateLogStreamMutation, props.currentStream],
	);

	const updateTimePartitionLimit = useCallback(() => {
		if (value === undefined) return;

		setUpdating(true);
		updateLogStream(value);
	}, [value, updateLogStream]);

	return (
		<Stack
			style={{
				flexDirection: 'row',
				alignItems: 'center',
			}}>
			<TextInput w={'100%'} placeholder="Max Historical Difference" value={value} onChange={(e) => onChange(e)} />
			<UpdateFieldButtons onUpdateClick={updateTimePartitionLimit} onClose={props.onClose} isUpdating={updating} />
		</Stack>
	);
};

const UpdateCustomPartitionField = (props: { onClose: () => void; currentStream: string }) => {
	const [info] = useStreamStore((store) => store.info);
	const isSchemaStatic = _.get(info, 'static_schema_flag', false);
	const updateableCustomPartition = _.get(info, 'custom_partition', '').split(',');
	const [value, setValue] = useState<string[] | undefined>(updateableCustomPartition);
	const [partitionFields]= useStreamStore((store) => store.fieldNames);
	const [updating, setUpdating] = useState<boolean>(false);
	const { updateLogStreamMutation } = useLogStream();
	const { getStreamInfoRefetch } = useGetStreamInfo(props.currentStream);

	const onChangeValue = useCallback(
		(value: string[]) => {
			setValue(value);
		},
		[setValue],
	);

	const updateLogStreamSuccess = useCallback(() => {
		props.onClose();
		setUpdating(false);
		getStreamInfoRefetch();
	}, [getStreamInfoRefetch]);

	const updateLogStream = useCallback(
		(updatedValue: string) => {
			updateLogStreamMutation({
				streamName: props.currentStream,
				header: { 'x-p-custom-partition': updatedValue },
				onSuccess: updateLogStreamSuccess,
				onError: () => setUpdating(false),
			});
		},
		[props.currentStream, updateLogStreamMutation],
	);

	const updateCustomPartition = useCallback(() => {
		const valuesFlattened = value?.join(',');

		if (valuesFlattened === undefined) return;

		setUpdating(true);
		updateLogStream(valuesFlattened);
	}, [value, updateLogStream]);

	

	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
			<TagsInput
				w={'30rem'}
				placeholder={isSchemaStatic ? 'Select column from the list' : 'Add upto 3 columns'}
				data={partitionFields}
				onChange={(value) => onChangeValue(value)}
				maxTags={3}
				value={(value?.length === 1) && (value?.[0] === '') ? undefined : value }
			/>
			<UpdateFieldButtons onUpdateClick={updateCustomPartition} onClose={props.onClose} isUpdating={updating} />
		</Stack>
	);
};

const InfoItem = (props: { title: string; value: string; fullWidth?: boolean; allowEdit?: boolean }) => {
	const [showEditField, setShowEditField] = useState<string | null>(null);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const closeEditField = useCallback(() => {
		setShowEditField(null);
	}, []);

	return (
		<>
			<Stack w={props.fullWidth ? '100%' : '33%'} gap={14}>
				<Group gap={6}>
					<Text
						className={classes.fieldDescription}
						style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
						{props.title}
					</Text>
					{props.allowEdit && showEditField !== props.title ? (
						<Tooltip label="Edit" withArrow position="top">
							<IconEdit
								className={classes.infoEditBtn}
								stroke={1.6}
								size={12}
								onClick={() => setShowEditField(props.title)}
							/>
						</Tooltip>
					) : null}
				</Group>
				{props.title === showEditField ? null : (
					<Text
						className={classes.fieldTitle}
						style={{
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							fontWeight: 400,
							height: '1.75rem',
						}}>
						{props.value}
					</Text>
				)}
				{showEditField === props.title && showEditField === 'Custom Partition Field' && (
					<UpdateCustomPartitionField onClose={closeEditField} currentStream={currentStream ? currentStream : ''} />
				)}
				{showEditField === props.title && showEditField === 'Max Historical Difference' && (
					<UpdateMaxHistoricalDifference onClose={closeEditField} currentStream={currentStream ? currentStream : ''} />
				)}
			</Stack>
		</>
	);
};

const InfoData = (props: { isLoading: boolean }) => {
	const [info] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);

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
		<Stack style={{ flex: 1 }}>
			{props.isLoading ? (
				<Stack style={{ flex: 1, width: '100%', alignItems: 'centrer', justifyContent: 'center' }}>
					<Stack style={{ alignItems: 'center' }}>
						<Loader />
					</Stack>
				</Stack>
			) : (
				<Stack style={{ flex: 1, padding: '1.5rem', justifyContent: 'space-between' }}>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Name" value={currentStream || ''} />
						<InfoItem title="Created At" value={createdAt} />
						<InfoItem title="First Event At" value={firstEventAt} />
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Schema Type" value={staticSchemaFlag} />
						<InfoItem title="Time Partition Field" value={timePartition} />
						<InfoItem title="Max Historical Difference" value={timePartitionLimit} allowEdit={timePartition !== '-'} />
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Custom Partition Field" value={customPartition} allowEdit fullWidth />
					</Stack>
				</Stack>
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
