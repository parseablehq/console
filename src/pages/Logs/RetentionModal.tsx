import { Button, Modal, Stack, Switch, TextInput } from '@mantine/core';
import { Text } from '@mantine/core';
import classes from './styles/Logs.module.css';
import { useCallback, useEffect } from 'react';
import { useCacheToggle } from '@/hooks/useCacheToggle';
import { useGetRetention, useRetentionEditor } from '@/hooks/useRetentionEditor';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';
import { useForm } from '@mantine/form';
import _ from 'lodash';

const { toggleRetentionModal, setRetention } = logsStoreReducers;

const RetentionForm = (props: { onToggleRetentionModal: () => void }) => {
	const [retention] = useLogsStore((store) => store.retention);
	const [currentStream] = useAppStore((store) => store.currentStream);
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

	const { updateLogStreamRetention } = useRetentionEditor(currentStream || '');

	const onSubmit = useCallback(
		({ reset }: { reset?: boolean }) => {
			if (reset) {
				updateLogStreamRetention({ config: [], onSuccess: props.onToggleRetentionModal });
			} else {
				const { hasErrors } = form.validate();
				if (hasErrors) return;

				const parsedDuration = `${form.values.duration}d`;
				updateLogStreamRetention({
					config: { ...form.values, duration: parsedDuration },
					onSuccess: props.onToggleRetentionModal,
				});
			}
		},
		[form.values],
	);

	return (
		<Stack gap={10}>
			<TextInput
				withAsterisk
				classNames={{ label: classes.fieldTitle }}
				styles={{ label: { marginBottom: 4 } }}
				label="Duration (In Days)"
				placeholder="Duration in days"
				key="duration"
				{...form.getInputProps('duration')}
			/>
			<TextInput
				classNames={{ label: classes.fieldTitle }}
				styles={{ label: { marginBottom: 4 } }}
				label="Action"
				key="action"
				disabled
				{...form.getInputProps('action')}
			/>
			<TextInput
				classNames={{ label: classes.fieldTitle }}
				styles={{ label: { marginBottom: 4 } }}
				label="Description"
				key="description"
				placeholder="Description"
				{...form.getInputProps('description')}
			/>
			<Stack style={{ alignItems: 'flex-end', marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
				<Button className={classes.submitBtn} onClick={() => onSubmit({ reset: true })} variant="outline">
					Reset Retention
				</Button>
				<Button className={classes.submitBtn} onClick={() => onSubmit({ reset: false })}>
					Submit
				</Button>
			</Stack>
		</Stack>
	);
};

const RententionModal = () => {
	const [currentStream] = useAppStore((store) => store.currentStream || '');
	const { isCacheEnabled, getCacheError, updateCacheStatus } = useCacheToggle(currentStream);
	const { getLogRetentionData, getLogRetentionIsSuccess } = useGetRetention(currentStream);
	const [retentionModalOpen, setLogsStore] = useLogsStore((store) => store.modalOpts.retentionModalOpen);
	const onToggleRetentionModal = useCallback(() => {
		setLogsStore((store) => toggleRetentionModal(store));
	}, []);
	useEffect(() => {
		if (getLogRetentionData?.data) {
			setLogsStore((store) => setRetention(store, getLogRetentionData?.data[0] || {}));
		}
	}, [getLogRetentionData?.data]);

	return (
		<Modal
			opened={retentionModalOpen}
			onClose={onToggleRetentionModal}
			centered
			title="Settings"
			classNames={{ title: classes.modalTitle }}>
			<Stack>
				<Stack
					className={classes.fieldsContainer}
					style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<Text className={classes.fieldTitle}>Caching</Text>
					<Stack style={{}}>
						{getCacheError ? (
							<Text className={classes.fieldDescription}>Global cache not set</Text>
						) : (
							<Switch
								checked={isCacheEnabled}
								labelPosition="left"
								onChange={(event) =>
									updateCacheStatus({ type: event.currentTarget.checked, onSuccess: onToggleRetentionModal })
								}
								label={isCacheEnabled ? 'Enabled' : 'Disabled'}
							/>
						)}
					</Stack>
				</Stack>
				<Stack className={classes.fieldsContainer}>
					<Text className={classes.fieldTitle}>Retention</Text>
					{getLogRetentionIsSuccess && <RetentionForm onToggleRetentionModal={onToggleRetentionModal} />}
				</Stack>
			</Stack>
		</Modal>
	);
};

export default RententionModal;
