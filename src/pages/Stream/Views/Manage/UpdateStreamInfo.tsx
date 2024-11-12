import { Box, Group, Loader, Stack, TagsInput, Tooltip, Text, TextInput } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { IconCheck, IconX, IconEdit } from '@tabler/icons-react';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { useLogStream } from '@/hooks/useLogStream';
import { useGetStreamInfo } from '@/hooks/useGetStreamInfo';

interface UpdateFieldButtonsProps {
	onClose: () => void;
	onUpdateClick: () => void;
	isUpdating: boolean;
}

interface PartitionLimitProps {
	timePartition: string;
	currentStream: string;
}

type PartitionValue = string[] | number | undefined;

const UpdateFieldButtons: FC<UpdateFieldButtonsProps> = ({ onClose, onUpdateClick, isUpdating }) => {
	return (
		<Box>
			{!isUpdating ? (
				<Stack gap={4} style={{ display: 'flex', flexDirection: 'row' }}>
					<Tooltip label="Update" withArrow position="top">
						<IconCheck className={classes.infoEditBtn} onClick={() => onUpdateClick()} stroke={1.6} size={16} />
					</Tooltip>

					<Tooltip label="Close" withArrow position="top">
						<IconX className={classes.infoEditBtn} stroke={1.6} size={16} onClick={() => onClose()} />
					</Tooltip>
				</Stack>
			) : (
				<Loader variant="ring" size="sm" style={{ padding: '0 0.2rem' }} />
			)}
		</Box>
	);
};

const UpdateStreamInfo: FC<PartitionLimitProps> = ({ timePartition, currentStream }) => {
	const [info] = useStreamStore((store) => store.info);
	const [partitionFields] = useStreamStore((store) => store.fieldNames);

	const isStaticSchema = _.get(info, 'static_schema_flag', false);
	const initialPartitionValue = isStaticSchema
		? _.get(info, 'custom_partition', '-').split(',')
		: _.get(info, 'time_partition_limit');

	const [value, setValue] = useState<PartitionValue>(initialPartitionValue);
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showEditField, setShowEditField] = useState(false);

	const { updateLogStreamMutation } = useLogStream();
	const { getStreamInfoRefetch } = useGetStreamInfo(currentStream, currentStream !== null);

	useEffect(() => {
		setValue(initialPartitionValue);
	}, [currentStream, info, initialPartitionValue]);

	const handleCustomPartitionChange = useCallback(
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

	const handleTimePartitionChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const inputTime = e.target.value;
			const numberRegex = /^\d*$/;
			if (numberRegex.test(inputTime)) {
				const parsedValue = parseInt(inputTime);
				if (parsedValue > 0) {
					setValue(parsedValue);
					setError(null);
				} else {
					setValue(0);
					setError('Number should be higher than zero');
				}
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
		(updatedValue: string | number) => {
			updateLogStreamMutation({
				streamName: currentStream,
				header: isStaticSchema
					? { 'x-p-custom-partition': String(updatedValue) }
					: { 'x-p-time-partition-limit': `${updatedValue}d` },
				onSuccess: updateLogStreamSuccess,
				onError: () => setUpdating(false),
			});
		},
		[updateLogStreamMutation, currentStream, isStaticSchema],
	);

	const updatePartitionLimit = useCallback(() => {
		if (error) return;
		if (isStaticSchema) {
			if (!Array.isArray(value) || value.length === 0) return;
			setUpdating(true);
			updateLogStream(value.join(','));
		} else {
			if (typeof value !== 'number') return;
			setUpdating(true);
			updateLogStream(value);
		}
	}, [value, updateLogStream]);

	return (
		<Stack style={{ height: '3.5rem', width: isStaticSchema ? '30rem' : '33%' }} gap={6}>
			<Group>
				<Text
					className={classes.fieldDescription}
					style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
					{isStaticSchema ? 'Custom Partition Field' : 'Max Historical Difference'}
				</Text>

				{timePartition !== '-' && !isStaticSchema && (
					<Tooltip label="Edit" withArrow position="top">
						<IconEdit
							className={classes.infoEditBtn}
							stroke={1.6}
							size={12}
							onClick={() => setShowEditField((prev) => !prev)}
						/>
					</Tooltip>
				)}
				{isStaticSchema && !showEditField && (
					<Tooltip label="Edit" withArrow position="top">
						<IconEdit
							className={classes.infoEditBtn}
							stroke={1.6}
							size={12}
							onClick={() => setShowEditField((prev) => !prev)}
						/>
					</Tooltip>
				)}
			</Group>

			{showEditField ? (
				<Group style={{ flexDirection: 'row', alignItems: 'baseline' }} gap={6}>
					{isStaticSchema ? (
						<TagsInput
							w={'30rem'}
							placeholder="Select column from the list"
							data={partitionFields}
							onChange={handleCustomPartitionChange}
							maxTags={3}
							value={Array.isArray(value) ? value : []}
							error={error}
						/>
					) : (
						<TextInput
							placeholder="Max Historical Difference"
							value={typeof value === 'number' ? value.toString() : ''}
							onChange={handleTimePartitionChange}
							error={error}
						/>
					)}

					<UpdateFieldButtons
						onUpdateClick={updatePartitionLimit}
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
					{isStaticSchema
						? Array.isArray(value)
							? value.join(',')
							: '-'
						: typeof value === 'number'
						? `${value} day(s)`
						: '-'}
				</Text>
			)}
		</Stack>
	);
};

export default UpdateStreamInfo;
