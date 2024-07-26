import { Box, Group, Loader, Stack, TagsInput, Tooltip, Text } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { IconCheck, IconX, IconEdit } from '@tabler/icons-react';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useLogStream } from '@/hooks/useLogStream';
import { useGetStreamInfo } from '@/hooks/useGetStreamInfo';

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

export default function UpdateCustomPartitionField(props: { timePartition: string; currentStream: string }) {
	const [info] = useStreamStore((store) => store.info);
	const isStaticSchema = _.get(info, 'static_schema_flag', false);
	const existingCustomPartition = _.get(info, 'custom_partition', '-').split(',');
	const [partitionFields] = useStreamStore((store) => store.fieldNames);
	const [value, setValue] = useState<string[]>([]);
	const [updating, setUpdating] = useState<boolean>(false);
	const [showEditField, setShowEditField] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { updateLogStreamMutation } = useLogStream();
	const { getStreamInfoRefetch } = useGetStreamInfo(props.currentStream);

	useEffect(() => {
		const customPartition: string = _.get(info, 'custom_partition', 'EMPTY_VALUE');
		setValue(customPartition !== 'EMPTY_VALUE' ? customPartition.split(',') : []);
	}, [props.currentStream, info]);

	const onChangeValue = useCallback(
		(value: string[]) => {
			setValue(value);

			if (isStaticSchema) {
				value?.forEach((el) => {
					if (!partitionFields.includes(el)) {
						setError('Unknown Field Included');
					} else {
						setError(null);
					}
				});
			}
			if (Array.isArray(value) && value.length === 0) {
				setError(null);
			}
		},
		[setValue],
	);

	const updateLogStreamSuccess = useCallback(() => {
		getStreamInfoRefetch().then(() => {
			setUpdating(false);
			setShowEditField(false);
		});
	}, [getStreamInfoRefetch]);

	const updateLogStream = useCallback(
		(updatedValue: string) => {
			updateLogStreamMutation({
				streamName: props.currentStream,
				header: { 'x-p-custom-partition': updatedValue },
				onSuccess: updateLogStreamSuccess,
				onError: () => {
					setUpdating(false), setValue(existingCustomPartition);
				},
			});
		},
		[props.currentStream, updateLogStreamMutation],
	);

	const updateCustomPartition = useCallback(() => {
		const valuesFlattened = value?.join(',');

		if (valuesFlattened === undefined) return;
		if (error !== null) return;

		setUpdating(true);
		updateLogStream(valuesFlattened);
	}, [value, updateLogStream]);

	return (
		<Stack style={{ flexDirection: 'column', height: '3.5rem' }} gap={6}>
			<Group>
				<Text
					className={classes.fieldDescription}
					style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
					Custom Partition Field
				</Text>

				<Tooltip label="Edit" withArrow position="top">
					<IconEdit
						className={classes.infoEditBtn}
						stroke={1.6}
						size={12}
						onClick={() => setShowEditField((prev) => !prev)}
					/>
				</Tooltip>
			</Group>
			{showEditField ? (
				<Group style={{ flexDirection: 'row', alignItems: 'baseline' }}>
					<TagsInput
						w={'30rem'}
						placeholder={isStaticSchema ? 'Select column from the list' : 'Add upto 3 columns'}
						data={partitionFields}
						onChange={(value) => onChangeValue(value)}
						maxTags={3}
						value={value?.length === 1 && value?.[0] === '' ? undefined : value}
						error={error}
					/>
					<UpdateFieldButtons
						onUpdateClick={updateCustomPartition}
						onClose={() => setShowEditField(false)}
						isUpdating={updating}
					/>
				</Group>
			) : (
				<Text
					className={classes.fieldTitle}
					style={{
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						fontWeight: 400,
					}}>
					{existingCustomPartition.join(',')}
				</Text>
			)}
		</Stack>
	);
}
