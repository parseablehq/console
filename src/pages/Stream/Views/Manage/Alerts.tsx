import { Button, Stack, Text, Box, Tooltip, Modal, TextInput, Select, Checkbox, NumberInput, Loader } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { TransformedAlert } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconEdit, IconInfoCircleFilled, IconPlus, IconTrash } from '@tabler/icons-react';
import { UseFormReturnType, useForm } from '@mantine/form';
import { useStreamStore, streamStoreReducers } from '../../providers/StreamProvider';

const defaultColumnTypeConfig = { column: '', operator: '=', value: '', repeats: 1, ignoreCase: false };
const defaultColumnTypeRule = { type: 'column' as 'column', config: defaultColumnTypeConfig };
const {transformAlerts} = streamStoreReducers;

const stringOperators = [
	{ value: '=', label: 'equals to' },
	{ value: '!=', label: 'not equals to' },
	{ value: '=%', label: 'contains' },
	{ value: '!%', label: 'not contains' },
	{ value: '~', label: 'regex' },
];

const numericalOperators = [
	{ value: '=', label: 'equals to' },
	{ value: '!=', label: 'not equals to' },
	{ value: '>', label: 'greater than' },
	{ value: '>=', label: 'greater than or equal to' },
	{ value: '<', label: 'less than' },
	{ value: '<=', label: 'less than or equal to' },
];

const targetTypeSpecialFields = {
	alertmanager: ['username', 'password', 'skip_tls_check'],
	webhook: ['skip_tls_check', 'headers'],
};

const alertTargets = ['alertmanager', 'webhook', 'slack'];
const defaultHeader = { header: '', value: '' };
const defaultTarget = {
	type: alertTargets[0],
	endpoint: '',
	username: '',
	password: '',
	headers: [],
	skip_tls_check: false,
	repeat: {
		interval: '',
		times: 0,
	},
};

const defaultAlert = {
	name: '',
	message: '',
	rule: defaultColumnTypeRule,
	targets: [defaultTarget],
};

const columnRuleType = 'column';
const compositeRuleType = 'composite';

const isValidName = (name: string, allAlertsNames: string[]) => {
	if (_.isEmpty(name)) {
		return 'Name cannot be empty';
	} else if (_.filter(allAlertsNames, (n) => n === name).length > 1) {
		return 'Name should be unique';
	} else {
		return null;
	}
};

const validateRepeatInterval = (value: string) => {
	if (_.isEmpty(value)) return 'Cannot be empty';

	const durationRegex = /^(\d+h)?\s?(\d+m)?\s?(\d+s)?$/;
	const isValidDuration = durationRegex.test(value);
	return isValidDuration ? null : 'Invalid Interval';
};

type FormOpts = {
	formValues: TransformedAlert;
	allAlertNames: string[];
};

// const validateRuleConfig = (config: ConfigType | string) => {
// 	if (_.isString(config)) {
// 		return _.isEmpty(config) ? 'Cannot be empty' : null;
// 	} else {
// 		return {
// 			column: _.isEmpty(config.column) ? 'Unknown Column' : null,
// 			operator: _.isEmpty(config.operator) ? 'Unknown Operator' : null,
// 			value: _.isString(config.value) || _.isNumber(config.value) ? null : 'Value cannot be empty',
// 			repeats: _.isNumber(config.repeats) && config.repeats > 0 ? null : 'Must be an integer',
// 		};
// 	}
// };

const useAlertsForm = (opts: FormOpts) => {
	const form = useForm<TransformedAlert>({
		mode: 'controlled',
		initialValues: opts.formValues,
		validate: {
			name: (value) => isValidName(value, opts.allAlertNames || []),
			message: (value) => (_.isEmpty(value) ? 'Message cannot be empty' : null),
			rule: {
				type: (value: 'column' | 'composite') => (_.includes([columnRuleType, compositeRuleType], value) ? null : 'Unknown rule type'),
			},
			targets: {
				endpoint: (value) => (_.isEmpty(value) ? 'Cannot be empty' : null),
				repeat: {
					interval: (value) => validateRepeatInterval(value),
					times: (value) => (_.isInteger(value) ? null : 'Must be an Integer'),
				},
			},
		},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const onAddField = useCallback(() => {
		form.insertListItem('alerts', defaultAlert);
	}, []);

	const onRemoveField = useCallback((index: number) => {
		form.removeListItem('fields', index);
	}, []);

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
	}, []);

	return { form, onAddField, onRemoveField, onChangeValue };
};

type RuleSectionHeaderProps = {
	form: AlertsFormType;
};

const RuleSectionHeader = (props: RuleSectionHeaderProps) => {
	const { form } = props;
	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
			<Stack gap={0} w="50%">
				<Text className={classes.fieldTitle}>Rule</Text>
				<Text className={classes.fieldDescription}>Description for rule</Text>
			</Stack>
			<Select w="30%" data={[columnRuleType as 'column', compositeRuleType as 'composite']} {...form.getInputProps('rule.type')} />
		</Stack>
	);
};

type ColumnRuleProps = {
	form: AlertsFormType;
};

const getInputComponent = (type: 'text' | 'number') => {
	return type === 'text' ? TextInput : NumberInput;
};

const ColumnRule = (props: ColumnRuleProps) => {
	const { form } = props;
	const [fieldNames] = useStreamStore((store) => store.fieldNames);
	const [fieldTypeMap] = useStreamStore((store) => store.fieldTypeMap);

	const {
		rule: { config },
	} = form.getValues();
	const columnDataType = _.isString(config) ? 'text' : _.get(fieldTypeMap, [config?.column], 'text');

	const InputComponent = useMemo(() => getInputComponent(columnDataType), [columnDataType]);

	return (
		<Stack>
			<Stack style={{ flexDirection: 'row' }}>
				<Select
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					label="Column"
					data={fieldNames}
					searchable
					{...form.getInputProps('rule.config.column')}
				/>
				<Select
					label="Operator"
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					data={columnDataType === 'text' ? stringOperators : numericalOperators}
					{...form.getInputProps('rule.config.operator')}
				/>
				<InputComponent
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					label="Value"
					placeholder="Value"
					key="value"
					{...form.getInputProps('rule.config.value')}
				/>
			</Stack>
			<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
				<NumberInput
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					label="Repeats"
					placeholder="Repeats"
					key="repeats"
					{...form.getInputProps('rule.config.repeats')}
					min={1}
				/>
				<Stack gap={8}>
					<Text className={classes.fieldTitle} style={{ marginBottom: 8 }}>
						Case sensitive
					</Text>
					<Checkbox
						label={_.isString(config) || config.ignore_case ? 'Ignored' : 'Enabled'}
						styles={{ label: { marginBottom: 8 } }}
						classNames={{ label: classes.fieldTitle }}
						key="ignore_case"
						{...form.getInputProps('rule.config.ignore_case')}
						{...(columnDataType === 'text' ? {} : { disabled: true, checked: true })}
						onChange={(e) => {
							form.setFieldValue('rule.config.ignore_case', e.target.checked);
						}}
					/>
				</Stack>
			</Stack>
		</Stack>
	);
};

type TargetsSectionProps = {
	form: AlertsFormType;
};

const TargetsHeader = () => {
	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
			<Stack gap={0} w="50%">
				<Text className={classes.fieldTitle}>Targets</Text>
				<Text className={classes.fieldDescription}>Description for target</Text>
			</Stack>
		</Stack>
	);
};

const getSpecialFieldsConfig = (type: string) => {
	const specialFields = _.get(targetTypeSpecialFields, type, []);
	return {
		tlsField: _.includes(specialFields, 'skip_tls_check'),
		authField: _.includes(specialFields, 'username'),
		headersField: _.includes(specialFields, 'headers'),
	};
};

const TargetsSection = (props: TargetsSectionProps) => {
	const { form } = props;
	const { targets } = form.getValues();
	const addTarget = useCallback(() => {
		form.insertListItem('targets', defaultTarget, _.size(targets));
	}, [targets]);

	const createHeader = useCallback((path: string) => {
		form.setFieldValue(`${path}`, defaultHeader);
	}, []);

	const deleteHeader = useCallback((headersPath: string, index: number) => {
		form.removeListItem(headersPath, index);
	}, []);

	return (
		<Stack className={classes.fieldsContainer} gap={2} mt={10}>
			<TargetsHeader />
			<Stack>
				{_.map(targets, (target, targetIndex) => {
					const { type, headers = [], skip_tls_check } = target;
					const targetsPath = `targets.${targetIndex}`;
					const headersPath = `${targetsPath}.headers`;
					const specialFieldsConfig = getSpecialFieldsConfig(type);
					const removeTarget = () => {
						form.removeListItem('targets', targetIndex);
					};

					return (
						<Stack gap={12} className={classes.targetContainer}>
							<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Select
										label="Type"
										classNames={{ label: classes.fieldTitle }}
										styles={{ label: { marginBottom: 8 } }}
										data={alertTargets}
										{...form.getInputProps(`${targetsPath}.type`)}
									/>
									{specialFieldsConfig.tlsField && (
										<Stack gap={8}>
											<Text className={classes.fieldTitle}>TLS Check</Text>
											<Checkbox
												style={{ marginTop: 8 }}
												label={!skip_tls_check ? 'Disabled' : 'Enabled'}
												classNames={{ label: classes.fieldTitle }}
												{...form.getInputProps(`${targetsPath}.skip_tls_check`)}
											/>
										</Stack>
									)}
								</Stack>
								<IconTrash stroke={1.2} onClick={removeTarget} color="gray" />
							</Stack>
							<TextInput
								classNames={{ label: classes.fieldTitle }}
								styles={{ label: { marginBottom: 8 } }}
								label="Endpoint"
								placeholder="Endpoint"
								key="endpoint"
								{...props.form.getInputProps(`${targetsPath}.endpoint`)}
							/>
							{specialFieldsConfig.authField && (
								<Stack style={{ flexDirection: 'row' }}>
									<TextInput
										classNames={{ label: classes.fieldTitle }}
										w="50%"
										styles={{ label: { marginBottom: 8 } }}
										label="Username"
										placeholder="Username"
										key="username"
										{...form.getInputProps(`${targetsPath}.username`)}
									/>
									<TextInput
										classNames={{ label: classes.fieldTitle }}
										w="50%"
										styles={{ label: { marginBottom: 8 } }}
										label="Password"
										placeholder="Password"
										key="password"
										{...form.getInputProps(`${targetsPath}.password`)}
									/>
								</Stack>
							)}
							<Stack style={{ flexDirection: 'row' }}>
								<TextInput
									classNames={{ label: classes.fieldTitle }}
									w="50%"
									styles={{ label: { marginBottom: 8 } }}
									label={<RepeatIntervalLabel />}
									placeholder="Repeat Interval"
									key="interval"
									{...form.getInputProps(`${targetsPath}.repeat.interval`)}
								/>
								<NumberInput
									classNames={{ label: classes.fieldTitle }}
									w="50%"
									styles={{ label: { marginBottom: 8 } }}
									label="Repeat Times"
									placeholder="Repeat Times"
									key="times"
									min={1}
									{...form.getInputProps(`${targetsPath}.repeat.times`)}
								/>
							</Stack>
							{specialFieldsConfig.headersField && (
								<>
									<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<Text className={classes.fieldTitle}>Headers</Text>
										<IconPlus
											onClick={() => createHeader(`${headersPath}.${_.size(headers)}`)}
											stroke={1.2}
											color="gray"
										/>
									</Stack>
									{_.map(headers, (_header, headerIndex) => {
										return (
											<Stack style={{ flexDirection: 'row' }}>
												<TextInput
													classNames={{ label: classes.fieldTitle }}
													w="50%"
													styles={{ label: { marginBottom: 8 } }}
													key="username"
													{...form.getInputProps(`${targetsPath}.headers.${headerIndex}.header`)}
												/>
												<TextInput
													classNames={{ label: classes.fieldTitle }}
													w="50%"
													styles={{ label: { marginBottom: 8 } }}
													key="password"
													{...form.getInputProps(`${targetsPath}.headers.${headerIndex}.value`)}
												/>
												<IconTrash stroke={1.2} onClick={() => deleteHeader(headersPath, headerIndex)} color="gray" />
											</Stack>
										);
									})}
								</>
							)}
						</Stack>
					);
				})}
			</Stack>
			<Box mt={8}>
				<Button
					leftSection={<IconPlus stroke={1.2} />}
					variant="outline"
					onClick={addTarget}
					className={classes.formBtn}>
					Add Target
				</Button>
			</Box>
		</Stack>
	);
};

const RepeatIntervalLabel = () => {
	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
			<Text className={classes.fieldTitle}>Repeat Interval</Text>
			<Tooltip
				multiline
				w={220}
				withArrow
				transitionProps={{ duration: 200 }}
				label="Interval should be in Go duration format. For eg: '20s' or '1h 1m 1s'">
				<IconInfoCircleFilled className={classes.infoTooltipIcon} stroke={1.4} height={18} width={18} />
			</Tooltip>
		</Stack>
	);
};

const AlertForm = (props: { form: AlertsFormType }) => {
	const { form } = props;
	const {
		rule: { type },
	} = form.getValues();

	useEffect(() => {
		if (type === 'column') {
			form.setFieldValue('rule.config', defaultColumnTypeConfig);
		} else {
			form.setFieldValue('rule.config', '');
		}
	}, [type]);

	return (
		<Stack gap={8}>
			<TextInput
				classNames={{ label: classes.fieldTitle }}
				styles={{ label: { marginBottom: 8 } }}
				label="Name"
				placeholder="Name"
				key="name"
				{...form.getInputProps('name')}
			/>
			<TextInput
				classNames={{ label: classes.fieldTitle }}
				styles={{ label: { marginBottom: 8 } }}
				label="Message"
				placeholder="Message"
				key="message"
				{...form.getInputProps('message')}
			/>
			<Stack className={classes.fieldsContainer} gap={2} mt={10}>
				<RuleSectionHeader form={form} />
				{type === 'column' ? (
					<ColumnRule form={form} />
				) : (
					<TextInput
						classNames={{ label: classes.fieldTitle }}
						styles={{ label: { marginBottom: 8 } }}
						label="Config"
						placeholder="Config"
						key="config"
						{...form.getInputProps('rule.config')}
					/>
				)}
			</Stack>
			<TargetsSection form={form} />
		</Stack>
	);
};

type AlertsFormType = UseFormReturnType<TransformedAlert, (values: TransformedAlert) => TransformedAlert>;

const AlertsModal = (props: { open: boolean; alertName: string; onClose: () => void, updateAlerts: ({ config, onSuccess }: { config: any, onSuccess: () => void }) => void; }) => {
	const { open, alertName, onClose, updateAlerts } = props;
	const [alertsConfig] = useStreamStore((store) => store.alertsConfig);
	const { alerts } = alertsConfig;
	const alert = _.find(alerts, (alert) => alert.name === alertName);
	const allAlertNames = _.map(alerts, (alert) => alert.name);
	const { form } = useAlertsForm({ formValues: defaultAlert, allAlertNames });

	useEffect(() => {
		if (!_.isEmpty(alert)) {
			form.setValues(alert);
		} else {
			form.setValues(defaultAlert);
		}
	}, [alert]);

	const onSubmitSuccess = useCallback(() => {
		form.setValues(defaultAlert);
		onClose();
	}, [])

	const onSubmit = useCallback(() => {
		const errors = form.validate()
		if (!errors.hasErrors) {
			const formValues = form.values;
			const allAlerts = (() => {
				if (alert) {
					const alertIndex = _.findIndex(alerts, alert => alert.name === formValues.name)
					const modifiedAlerts = _.clone(alerts);
					modifiedAlerts[alertIndex] = formValues; 
					return modifiedAlerts;
				} else {
					return [...alerts, formValues]
				}
			})()
			const transformedAlerts = transformAlerts(allAlerts)
			updateAlerts({config: {...alertsConfig, alerts: transformedAlerts}, onSuccess: onSubmitSuccess})
		}
	}, [updateAlerts, form, alertsConfig, alert])

	return (
		<Modal
			opened={open}
			onClose={onClose}
			centered
			size="lg"
			title={!_.isEmpty(alertName) ? 'Edit Alert' : 'New Alert'}
			styles={{ body: { padding: '0 1rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			classNames={{ title: classes.modalTitle }}>
			<Stack gap={0}>
				<Stack mih={400} style={{ maxHeight: 600, overflow: 'scroll' }}>
					{/* @ts-ignore */}
					<AlertForm form={form} />
				</Stack>
				<Stack style={{ flexDirection: 'row', margin: '1.2rem 0', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={onClose} variant="outline">
							Cancel
						</Button>
					</Box>
					<Box>
						<Button onClick={onSubmit}>Save</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

const Header = (props: { selectAlert: selectAlert, isLoading: boolean }) => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Alerts</Text>
			{!props.isLoading && (
				<Box>
					<Button
						variant="outline"
						onClick={() => props.selectAlert('')}
						h={'2rem'}
						leftSection={<IconPlus stroke={2} />}>
						New Alert
					</Button>
				</Box>
			)}
		</Stack>
	);
};

const AlertItem = (props: { alert: TransformedAlert; selectAlert: selectAlert, onDeleteAlert: (name: string) => void; }) => {
	const { alert, selectAlert } = props;
	const { name } = alert;

	return (
		<Stack className={classes.alertItemContainer}>
			<Text className={classes.alertName}>{name}</Text>
			<Stack className={classes.alertActionsContainer}>
				<Tooltip label="Edit">
					<IconEdit stroke={1.2} onClick={() => selectAlert(name)} />
				</Tooltip>
				<Tooltip label="Delete" onClick={() => props.onDeleteAlert(name)}>
					<IconTrash stroke={1.2} />
				</Tooltip>
			</Stack>
		</Stack>
	);
};

type selectAlert = (title: string) => void;

const AlertList = (props: { selectAlert: selectAlert, isLoading: boolean, updateAlerts: ({ config }: { config: any }) => void; }) => {
	const [alertsConfig] = useStreamStore((store) => store.alertsConfig);
	const { alerts } = alertsConfig;

	const onDeleteAlert = useCallback(
		(alertName: string) => {
			const alertIndex = _.findIndex(alerts, (alert) => alert.name === alertName);
			const modifiedAlerts = _.clone(alerts);
			modifiedAlerts.splice(alertIndex, 1);
			const transformedAlerts = transformAlerts(modifiedAlerts)
			props.updateAlerts({ config: { ...alertsConfig, alerts: transformedAlerts } });
		},
		[alertsConfig],
	);

	return (
		<Stack className={classes.listContainer} gap={0}>
			{props.isLoading ? (
				<Stack style={{ flex: 1, width: '100%', alignItems: 'centrer', justifyContent: 'center' }}>
					<Stack style={{ alignItems: 'center' }}>
						<Loader />
					</Stack>
				</Stack>
			) : (
				<>
					{_.map(alerts, (alert) => {
						return <AlertItem alert={alert} selectAlert={props.selectAlert} onDeleteAlert={onDeleteAlert}/>;
					})}
				</>
			)}
		</Stack>
	);
};

const Alerts = (props: {
	isLoading: boolean;
	schemaLoading: boolean;
	updateAlerts: ({ config, onSuccess }: { config: any, onSuccess?: () => void; }) => void;
}) => {
	const [alertName, setAlertName] = useState<string>('');
	const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

	const selectAlert = useCallback((title: string) => {
		setAlertName(title);
		setAlertModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setAlertModalOpen(false);
	}, []);

	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<AlertsModal open={alertModalOpen} alertName={alertName} onClose={closeModal} updateAlerts={props.updateAlerts}/>
			<Header selectAlert={selectAlert} isLoading={props.isLoading} />
			<AlertList selectAlert={selectAlert} isLoading={props.isLoading} updateAlerts={props.updateAlerts}/>
		</Stack>
	);
};

export default Alerts;
