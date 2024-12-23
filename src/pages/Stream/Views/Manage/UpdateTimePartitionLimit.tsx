import _ from 'lodash';
import { useStreamStore } from '../../providers/StreamProvider';
import { ChangeEvent, useCallback, useState, useEffect } from 'react';
import { useLogStream } from '@/hooks/useLogStream';
import { useGetStreamInfo } from '@/hooks/useGetStreamInfo';
import { Box, Loader, Stack, TextInput, Tooltip, Text, Group } from '@mantine/core';
import { IconCheck, IconX, IconEdit } from '@tabler/icons-react';
import classes from '../../styles/Management.module.css';

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

function UpdateTimePartitionLimit(props: { timePartition: string; currentStream: string }) {
	const [info] = useStreamStore((store) => store.info);
	const timePartitonLimit = _.get(info, 'time_partition_limit');
	const [value, setValue] = useState<number | undefined>(timePartitonLimit);
	const [updating, setUpdating] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [showEditField, setShowEditField] = useState<boolean>(false);
	const { updateLogStreamMutation } = useLogStream();
	const { getStreamInfoRefetch } = useGetStreamInfo(props.currentStream, props.currentStream !== null);

	useEffect(() => {
		setValue(timePartitonLimit);
	}, [props.currentStream, info]);

	const onChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const inputTime = e.target.value;
			const numberRegex = /^\d*$/;
			if (numberRegex.test(inputTime)) {
				if (parseInt(inputTime) > 0) {
					setValue(parseInt(inputTime));
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
		if (error !== null) return;

		setUpdating(true);
		updateLogStream(value);
	}, [value, updateLogStream]);

	return (
		<Stack style={{ height: '3.5rem', width: '33%' }} gap={6}>
			<Group>
				<Text
					className={classes.fieldDescription}
					style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
					Max Historical Difference
				</Text>

				{props.timePartition !== '-' && (
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
					<TextInput
						classNames={{ input: classes.inputField }}
						placeholder="Max Historical Difference"
						value={value}
						onChange={(e) => onChange(e)}
						error={error}
					/>
					<UpdateFieldButtons
						onUpdateClick={updateTimePartitionLimit}
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
					{timePartitonLimit !== undefined ? `${timePartitonLimit} day(s)` : '-'}
				</Text>
			)}
		</Stack>
	);
}

export default UpdateTimePartitionLimit;
