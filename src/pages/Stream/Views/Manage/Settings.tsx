import { Box, Button, Divider, Loader, Modal, NumberInput, Stack, TextInput } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { Text } from '@mantine/core';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useForm } from '@mantine/form';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useStreamStore } from '../../providers/StreamProvider';
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { sanitizeBytes, convertGibToBytes } from '@/utils/formatBytes';
import timeRangeUtils from '@/utils/timeRangeUtils';

const { getDateTimeWithTZ } = timeRangeUtils;

const Header = () => {
	return (
		<Stack className={classes.headerContainer} style={{ minHeight: '3rem', maxHeight: '3rem' }}>
			<Text className={classes.title}>Settings</Text>
		</Stack>
	);
};

const RetentionForm = (props: { updateRetentionConfig: ({ config }: { config: any }) => void }) => {
	const [retention] = useStreamStore((store) => store.retention);
	const form = useForm({
		mode: 'controlled',
		initialValues: {
			duration: retention.duration,
			description: retention.description,
			action: 'delete',
		},
		validate: {
			duration: (val) => (_.toInteger(val) <= 0 ? 'Must be a number greater than 0' : null),
		},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	useEffect(() => {
		form.setValues({
			duration: retention.duration,
			description: retention.description,
		});
	}, [retention]);

	const onSubmit = useCallback(
		({ reset }: { reset?: boolean }) => {
			if (reset) {
				props.updateRetentionConfig({ config: [] });
			} else {
				const { hasErrors } = form.validate();
				if (hasErrors) return;

				const parsedDuration = `${form.values.duration}d`;
				props.updateRetentionConfig({
					config: [{ ...form.values, duration: parsedDuration }],
				});
			}
		},
		[form.values],
	);

	return (
		<Stack gap={12} flex={1}>
			<Stack gap={8}>
				<Stack gap={16} style={{ flexDirection: 'row', width: '100%' }}>
					<NumberInput
						withAsterisk
						classNames={{ label: classes.fieldDescription }}
						styles={{ label: { marginBottom: 4 } }}
						label="Duration (In Days)"
						placeholder="Duration in days"
						key="duration"
						{...form.getInputProps('duration')}
						style={{ width: '50%' }}
					/>
					<TextInput
						classNames={{ label: classes.fieldDescription }}
						styles={{ label: { marginBottom: 4 } }}
						label="Action"
						key="action"
						disabled
						{...form.getInputProps('action')}
						style={{ width: '50%' }}
					/>
				</Stack>
				<TextInput
					classNames={{ label: classes.fieldDescription }}
					styles={{ label: { marginBottom: 4 } }}
					label="Description"
					key="description"
					placeholder="Description"
					{...form.getInputProps('description')}
				/>
			</Stack>
			<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end' }} mt="0.6rem">
				<Button
					className={classes.submitBtn}
					onClick={() => onSubmit({ reset: true })}
					variant="outline"
					disabled={retention.duration === 0}>
					Reset
				</Button>
				<Button className={classes.submitBtn} onClick={() => onSubmit({ reset: false })} disabled={!form.isDirty()}>
					Submit
				</Button>
			</Stack>
		</Stack>
	);
};

function extractNumber(value: string | null) {
	if (_.isEmpty(value) || value === null) return 0;

	const regex = /^(\d+)/;
	const match = value.match(regex);

	return match ? parseFloat(match[0]) : 0;
}

const DeleteHotTierModal = (props: {
	deleteHotTierInfo: ({ onSuccess }: { onSuccess: () => void }) => void;
	isDeleting: boolean;
	closeModal: () => void;
	showDeleteModal: boolean;
}) => {
	const [currentStream] = useAppStore((store) => store.currentStream);

	const onDelete = useCallback(() => {
		props.deleteHotTierInfo({ onSuccess: props.closeModal });
	}, []);

	return (
		<Modal
			opened={props.showDeleteModal}
			onClose={props.closeModal}
			size="auto"
			centered
			styles={{
				body: { padding: '0 1rem 1rem 1rem', width: 400 },
				header: { padding: '1rem', paddingBottom: '0.4rem' },
			}}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Delete Hot Tier</Text>}>
			<Stack>
				<Stack gap={8}>
					<Text className={classes.deleteWarningText}>
						Are you sure want to reset hot tier config and cached data for {currentStream} ?
					</Text>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={props.closeModal} variant="outline">
							Cancel
						</Button>
					</Box>
					<Box>
						<Button loading={props.isDeleting} onClick={onDelete}>
							Delete
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

const HotTierConfig = (props: {
	updateHotTierInfo: ({ size }: { size: string }) => void;
	deleteHotTierInfo: ({ onSuccess }: { onSuccess: () => void }) => void;
	isDeleting: boolean;
	isUpdating: boolean;
}) => {
	const [hotTier] = useStreamStore((store) => store.hotTier);
	const [info] = useStreamStore((store) => store.info);
	const streamType = 'stream_type' in info && info.stream_type;
	const size = _.get(hotTier, 'size', '');
	const usedSize = _.get(hotTier, 'used_size', '');
	const availableSize = _.get(hotTier, 'available_size', '');
	const oldestEntry = _.get(hotTier, 'oldest_date_time_entry', '');
	const humanizedSize = sanitizeBytes(size);
	const humanizedUsedSize = sanitizeBytes(usedSize);
	const humanizedAvailableSize = sanitizeBytes(availableSize);
	const sanitizedSize = extractNumber(humanizedSize);
	const [localSizeValue, setLocalSizeValue] = useState<number>(sanitizedSize);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const onChangeHandler = useCallback((e: string | number) => {
		setLocalSizeValue(_.toNumber(e));
	}, []);

	const onCancel = useCallback(() => {
		setLocalSizeValue(sanitizedSize);
	}, [sanitizedSize]);

	useEffect(() => {
		setIsDirty(sanitizedSize !== localSizeValue);
	}, [localSizeValue]);

	useEffect(() => {
		setLocalSizeValue(sanitizedSize);
		setIsDirty(sanitizedSize !== localSizeValue);
	}, [hotTier]);

	const onUpdate = useCallback(() => {
		props.updateHotTierInfo({ size: `${convertGibToBytes(localSizeValue)}` });
	}, [localSizeValue]);

	const hotTierNotSet = _.isEmpty(size) || _.isEmpty(hotTier);
	const closeDeleteModal = useCallback(() => {
		return setShowDeleteModal(false);
	}, []);
	const openDeleteModal = useCallback(() => {
		return setShowDeleteModal(true);
	}, []);

	if (hotTierNotSet && streamType === 'Internal') return null;

	return (
		<Stack className={classes.fieldsContainer} style={{ border: 'none', gap: 16 }}>
			<DeleteHotTierModal
				deleteHotTierInfo={props.deleteHotTierInfo}
				isDeleting={props.isDeleting}
				closeModal={closeDeleteModal}
				showDeleteModal={showDeleteModal}
			/>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }} gap={8}>
				<Text className={classes.fieldTitle}>Hot Tier Storage Size</Text>
				{!hotTierNotSet && streamType === 'UserDefined' ? (
					<IconTrash onClick={openDeleteModal} stroke={1.2} size="1.2rem" className={classes.deleteIcon} />
				) : null}
			</Stack>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', height: '3.8rem' }}>
				<Stack gap={4} style={{ ...(hotTierNotSet ? { display: 'none' } : {}) }}>
					<Text className={classes.fieldDescription}>Oldest Record:</Text>
					<Text className={classes.fieldDescription}>
						{_.isEmpty(oldestEntry) ? 'No Entries Stored' : getDateTimeWithTZ(oldestEntry)}
					</Text>
				</Stack>
				<Stack style={{ width: hotTierNotSet ? '100%' : '50%' }} gap={isDirty || hotTierNotSet ? 16 : 4}>
					<Stack style={{}} gap={12}>
						{streamType === 'UserDefined' ? (
							<NumberInput
								classNames={{ label: classes.fieldDescription }}
								placeholder="Size in GiB"
								key="size"
								value={localSizeValue}
								onChange={onChangeHandler}
								min={0}
								suffix=" GiB"
								style={{ flex: 1 }}
							/>
						) : !hotTierNotSet ? (
							<DisabledInput size={humanizedSize} />
						) : null}
						<Text
							className={classes.fieldDescription}
							ta="end"
							style={{ ...(isDirty || hotTierNotSet ? { display: 'none' } : {}) }}>
							{humanizedUsedSize} used | {humanizedAvailableSize} available
						</Text>
					</Stack>
					<Stack
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-end',
							...(!isDirty || hotTierNotSet ? { display: 'none' } : {}),
						}}
						gap={12}>
						<Stack
							className={classes.actionIconClose}
							p="0.1rem"
							onClick={onCancel}
							style={{
								...(props.isUpdating ? { display: 'none' } : {}),
							}}>
							<IconX stroke={1.4} size="1rem" />
						</Stack>
						<Stack
							style={{
								...(props.isUpdating ? { display: 'none' } : {}),
							}}
							className={classes.actionIconCheck}
							p="0.1rem"
							onClick={onUpdate}>
							<IconCheck stroke={1.4} size="1.1rem" />
						</Stack>
						{props.isUpdating && <Loader size="sm" />}
					</Stack>
					<Stack style={{ alignItems: 'flex-end', ...(!hotTierNotSet ? { display: 'none' } : {}) }}>
						<Box>
							<Button onClick={onUpdate} disabled={localSizeValue <= 0} loading={props.isUpdating}>
								Submit
							</Button>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

const DisabledInput = (props: { size: string }) => {
	return <TextInput classNames={{ label: classes.fieldDescription }} disabled value={props.size} style={{ flex: 1 }} />;
};

const Settings = (props: {
	isLoading: boolean;
	updateRetentionConfig: ({ config }: { config: any }) => void;
	updateHotTierInfo: ({ size }: { size: string }) => void;
	deleteHotTierInfo: ({ onSuccess }: { onSuccess: () => void }) => void;
	isDeleting: boolean;
	isUpdating: boolean;
}) => {
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	return (
		<Stack className={classes.sectionContainer} gap={0} w="100%">
			<Header />
			<Stack gap={0} h="100%" pr="0.65rem" pl="0.65rem">
				{props.isLoading ? (
					<Stack style={{ flex: 1, width: '100%', alignItems: 'centrer', justifyContent: 'center' }}>
						<Stack style={{ alignItems: 'center' }}>
							<Loader />
						</Stack>
					</Stack>
				) : (
					<>
						{!isStandAloneMode && (
							<HotTierConfig
								updateHotTierInfo={props.updateHotTierInfo}
								deleteHotTierInfo={props.deleteHotTierInfo}
								isDeleting={props.isDeleting}
								isUpdating={props.isUpdating}
							/>
						)}
						<Divider />
						<Stack className={classes.fieldsContainer} style={{ border: 'none', flex: 1, gap: 4 }}>
							<Text className={classes.fieldTitle}>Retention</Text>
							<RetentionForm updateRetentionConfig={props.updateRetentionConfig} />
						</Stack>
					</>
				)}
			</Stack>
		</Stack>
	);
};

export default Settings;
