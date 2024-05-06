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

const RetentionForm = (props: { onToggleRetentionModal: () => void; getLogRetentionDataRefetch: () => void }) => {
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

	useEffect(() => {
		form.setValues({
			duration: retention.duration,
			description: retention.description,
		});
	}, [retention]);

	const { updateLogStreamRetention } = useRetentionEditor(currentStream || '');

	const onSuccess = useCallback(() => {
		props.getLogRetentionDataRefetch();
		props.onToggleRetentionModal();
	}, []);

	const onSubmit = useCallback(
		({ reset }: { reset?: boolean }) => {
			if (reset) {
				updateLogStreamRetention({ config: [], onSuccess });
			} else {
				const { hasErrors } = form.validate();
				if (hasErrors) return;

				const parsedDuration = `${form.values.duration}d`;
				updateLogStreamRetention({
					config: [{ ...form.values, duration: parsedDuration }],
					onSuccess,
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
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	const { isCacheEnabled, getCacheError, updateCacheStatus } = useCacheToggle(currentStream || '');
	const { getLogRetentionData, getLogRetentionIsSuccess, getLogRetentionDataRefetch } = useGetRetention(currentStream || '');
	const [retentionModalOpen, setLogsStore] = useLogsStore((store) => store.modalOpts.retentionModalOpen);
	const onCloseModal = useCallback(() => {
		setLogsStore((store) => toggleRetentionModal(store, false));
	}, []);
	useEffect(() => {
		if (getLogRetentionData?.data) {
			setLogsStore((store) => setRetention(store, getLogRetentionData?.data[0] || {}));
		}
	}, [getLogRetentionData?.data]);

	return (
		<Modal
			opened={retentionModalOpen}
			onClose={onCloseModal}
			centered
			title="Settings"
			classNames={{ title: classes.modalTitle }}>
			<Stack>
				<Stack
					className={classes.fieldsContainer}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						...(isStandAloneMode ? {} : { display: 'none' }),
					}}>
					<Text className={classes.fieldTitle}>Caching</Text>
					<Stack style={{}}>
						{getCacheError ? (
							<Text className={classes.fieldDescription}>Global cache not set</Text>
						) : (
							<Switch
								checked={isCacheEnabled}
								labelPosition="left"
								onChange={(event) =>
									updateCacheStatus({ type: event.currentTarget.checked, onSuccess: onCloseModal })
								}
								label={isCacheEnabled ? 'Enabled' : 'Disabled'}
							/>
						)}
					</Stack>
				</Stack>
				<Stack className={classes.fieldsContainer}>
					<Text className={classes.fieldTitle}>Retention</Text>
					{getLogRetentionIsSuccess && (
						<RetentionForm
							onToggleRetentionModal={onCloseModal}
							getLogRetentionDataRefetch={getLogRetentionDataRefetch}
						/>
					)}
				</Stack>
			</Stack>
		</Modal>
	);
};

export default RententionModal;
