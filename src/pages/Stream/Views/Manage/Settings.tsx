import { Button, Loader, NumberInput, Stack, Switch, TextInput } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { Text } from '@mantine/core';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useForm } from '@mantine/form';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import { useStreamStore } from '../../providers/StreamProvider';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
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
		<Stack gap={12} flex={1} style={{ justifyContent: 'space-between' }}>
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
				<Button
					className={classes.submitBtn}
					onClick={() => onSubmit({ reset: true })}
					variant="outline"
					disabled={retention.duration === 0}>
					Reset Retention
				</Button>
				<Button className={classes.submitBtn} onClick={() => onSubmit({ reset: false })} disabled={!form.isDirty()}>
					Submit
				</Button>
			</Stack>
		</Stack>
	);
};

const Settings = (props: {
	isLoading: boolean;
	getCacheError: boolean;
	updateCacheStatus: ({ type }: { type: boolean }) => void;
	updateRetentionConfig: ({ config }: { config: any }) => void;
}) => {
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	const [cacheEnabled] = useStreamStore((store) => store.cacheEnabled);
	return (
		<Stack className={classes.sectionContainer} gap={0} style={{ height: 'fit-content' }}>
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
						<Stack
							className={classes.fieldsContainer}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								borderColor: 'transparent',
								borderBottomColor: '#dee2e6',
								...(isStandAloneMode ? {} : { display: 'none' }),
							}}>
							<Text className={classes.fieldTitle}>Caching</Text>
							<Stack style={{}}>
								{props.getCacheError ? (
									<Text className={classes.fieldDescription}>Global cache not set</Text>
								) : (
									_.isBoolean(cacheEnabled) && (
										<Switch
											checked={cacheEnabled}
											labelPosition="left"
											onChange={(event) => props.updateCacheStatus({ type: event.currentTarget.checked })}
											label={cacheEnabled ? 'Enabled' : 'Disabled'}
										/>
									)
								)}
							</Stack>
						</Stack>
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
