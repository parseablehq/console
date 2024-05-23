import { Button, NumberInput, Stack, Switch, TextInput } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { Text } from '@mantine/core';
import { useLogsStore } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useForm } from '@mantine/form';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import { useRetentionEditor } from '@/hooks/useRetentionEditor';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Settings</Text>
		</Stack>
	);
};

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
		<Stack gap={10} flex={1} style={{ justifyContent: 'space-between' }}>
			<Stack gap={8}>
				<Stack gap={16} style={{ flexDirection: 'row', width: '100%' }}>
					<NumberInput
						withAsterisk
						classNames={{ label: classes.fieldTitle }}
						styles={{ label: { marginBottom: 4 } }}
						label="Duration (In Days)"
						placeholder="Duration in days"
						key="duration"
						{...form.getInputProps('duration')}
						style={{ width: '50%' }}
					/>
					<TextInput
						classNames={{ label: classes.fieldTitle }}
						styles={{ label: { marginBottom: 4 } }}
						label="Action"
						key="action"
						disabled
						{...form.getInputProps('action')}
						style={{ width: '50%' }}
					/>
				</Stack>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 4 } }}
					label="Description"
					key="description"
					placeholder="Description"
					{...form.getInputProps('description')}
				/>
			</Stack>
			<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
				<Button className={classes.submitBtn} onClick={() => onSubmit({ reset: true })} variant="outline" disabled={retention.duration === 0}>
					Reset Retention
				</Button>
				<Button className={classes.submitBtn} onClick={() => onSubmit({ reset: false })} disabled={!form.isDirty()}>
					Submit
				</Button>
			</Stack>
		</Stack>
	);
};

const Settings = () => {
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<Header />
			<Stack gap={0} h="100%">
				<Stack
					className={classes.fieldsContainer}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						border: 'none',
						...(true ? {} : { display: 'none' }),
					}}>
					<Text className={classes.fieldTitle}>Caching</Text>
					<Stack style={{}}>
						{false ? (
							<Text className={classes.fieldDescription}>Global cache not set</Text>
						) : (
							<Switch
								checked={false}
								labelPosition="left"
								// onChange={(event) =>
								// 	updateCacheStatus({ type: event.currentTarget.checked, onSuccess: onCloseModal })
								// }
								label={false ? 'Enabled' : 'Disabled'}
							/>
						)}
					</Stack>
				</Stack>
				<Stack className={classes.fieldsContainer} style={{ border: 'none', flex: 1 }}>
					<Text className={classes.fieldTitle}>Retention</Text>
					{true && <RetentionForm onToggleRetentionModal={_.noop} getLogRetentionDataRefetch={_.noop} />}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Settings;
