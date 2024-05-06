import { Box, Button, Checkbox, Modal, Select, Stack, TextInput } from '@mantine/core';
import { Text } from '@mantine/core';
import classes from './styles/Logs.module.css';
import { useCallback, useEffect, useState } from 'react';
import { useAlertsEditor, useGetAlerts } from '@/hooks/useAlertsEditor';
import { notifyError } from '@/utils/notification';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import {
	useLogsStore,
	logsStoreReducers,
	TransformedAlert,
	TransformedAlerts,
	ConfigType,
	TransformedTarget,
} from './providers/LogsProvider';
import _ from 'lodash';
import { UseFormReturnType, useForm } from '@mantine/form';
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { useFilterStore } from './providers/FilterProvider';

const { toggleAlertsModal, setAlerts, transformAlerts } = logsStoreReducers;
const defaultColumnTypeConfig = { column: '', operator: '=', value: '', repeats: 1, ignoreCase: false };
const defaultColumnTypeRule = { type: 'column', config: defaultColumnTypeConfig };

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

const isValidName = (name: string, allAlerts: TransformedAlert[]) => {
	const allNames = _.map(allAlerts, (alert) => alert.name);
	if (_.isEmpty(name)) {
		return 'Name cannot be empty';
	} else if (_.filter(allNames, (n) => n === name).length > 1) {
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

const useCreateAlertsForm = () => {
	const form = useForm<TransformedAlerts>({
		mode: 'controlled',
		initialValues: {
			version: 'v1',
			alerts: [],
		},
		validate: {
			alerts: {
				name: (value, formValue) => isValidName(value, formValue.alerts || []),
				message: (value) => (_.isEmpty(value) ? 'Message cannot be empty' : null),
				rule: {
					type: (value) => (_.includes([columnRuleType, compositeRuleType], value) ? null : 'Unknown rule type'),
					config: {
						column: (value) => (_.isEmpty(value) ? 'Unknown Column' : null),
						operator: (value) => (_.isEmpty(value) ? 'Unknown Operator' : null),
						value: (value) => (_.isString(value) || _.isNumber(value) ? null : 'Value cannot be empty'),
						repeats: (value) => (_.isNumber(value) && value > 0 ? null : 'Must be an integer'),
					},
				},
				targets: {
					endpoint: (value) => (_.isEmpty(value) ? 'Cannot be empty' : null),
					repeat: {
						interval: (value) => validateRepeatInterval(value),
						times: (value) => (_.isInteger(value) ? null : 'Must be an Integer'),
					},
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

type UsernameAndPasswordSectionProps = {
	form: AlertsFormType;
	targetsPath: string;
	username: string;
	password: string;
};

const UsernameAndPasswordSection = (props: UsernameAndPasswordSectionProps) => {
	const { form, targetsPath } = props;

	// useEffect(() => {
	// 	if (_.isEmpty(username)) {
	// 		form.setFieldError(`${targetsPath}.username`, 'Cannot be empty');
	// 	} else {
	// 		form.clearFieldError(`${targetsPath}.username`);
	// 	}

	// 	if (_.isEmpty(password)) {
	// 		form.setFieldError(`${targetsPath}.password`, 'Cannot be empty');
	// 	} else {
	// 		form.clearFieldError(`${targetsPath}.password`);
	// 	}

	// 	return () => {
	// 		form.clearFieldError(`${targetsPath}.username`);
	// 		form.clearFieldError(`${targetsPath}.password`);
	// 	};
	// }, [username, password]);

	return (
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
	);
};

type HeadersSectionProps = {
	form: AlertsFormType;
	targetsPath: string;
	headers: Record<string, string>[];
};

const HeadersSection = (props: HeadersSectionProps) => {
	const { form, targetsPath, headers } = props;
	const headersPath = `${targetsPath}.headers`;
	const createHeader = useCallback(() => {
		const createIndex = _.size(headers);
		form.setFieldValue(`${headersPath}.${createIndex}`, defaultHeader);
	}, [headers]);

	const deleteHeader = useCallback((index: number) => {
		form.removeListItem(headersPath, index);
	}, []);

	// useEffect(() => {
	// 	_.map(headers, (h, index) => {
	// 		const { header, value } = h;
	// 		const headerPath = `${headersPath}.${index}.header`;
	// 		const valuePath = `${headersPath}.${index}.value`;
	// 		_.isEmpty(header) && form.setFieldError(headerPath, 'Cannot be empty');
	// 		_.isEmpty(value) && form.setFieldError(valuePath, 'Cannot be empty');
	// 	});

	// 	return () => {
	// 		_.map(headers, (_h, index) => {
	// 			const headerPath = `${headersPath}.${index}.header`;
	// 			const valuePath = `${headersPath}.${index}.value`;
	// 			form.clearFieldError(headerPath);
	// 			form.clearFieldError(valuePath);
	// 		});
	// 	};
	// }, [headers]);
	return (
		<>
			<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
				<Text className={classes.fieldTitle}>Headers</Text>
				<IconPlus onClick={createHeader} stroke={1.2} color="gray" />
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
						<IconTrash stroke={1.2} onClick={() => deleteHeader(headerIndex)} color="gray" />
					</Stack>
				);
			})}
		</>
	);
};

type RepeatConfigProps = {
	form: AlertsFormType;
	targetsPath: string;
};

const RepeatConfig = (props: RepeatConfigProps) => {
	const { form, targetsPath } = props;
	const setReapeats = useCallback((val: string) => {
		const path = `${targetsPath}.repeat.times`;
		const parsedValue = val === '' ? null : _.toInteger(val);
		form.setFieldValue(path, parsedValue);

		!_.isNumber(parsedValue) || parsedValue < 0
			? form.setFieldError(path, 'Must be a number greater than 0')
			: form.clearFieldError(path);
	}, []);
	return (
		<Stack style={{ flexDirection: 'row' }}>
			<TextInput
				classNames={{ label: classes.fieldTitle }}
				w="50%"
				styles={{ label: { marginBottom: 8 } }}
				label="Repeat Interval"
				placeholder="Repeat Interval"
				key="interval"
				{...form.getInputProps(`${targetsPath}.repeat.interval`)}
			/>
			<TextInput
				classNames={{ label: classes.fieldTitle }}
				w="50%"
				styles={{ label: { marginBottom: 8 } }}
				label="Repeat Times"
				placeholder="Repeat Times"
				key="times"
				type="number"
				{...form.getInputProps(`${targetsPath}.repeat.times`)}
				onChange={(e) => setReapeats(e.target.value)}
				onWheel={numberInputOnWheelPreventChange}
			/>
		</Stack>
	);
};

type EndpointfieldProps = {
	form: AlertsFormType;
	targetsPath: string;
};

const Endpointfield = (props: EndpointfieldProps) => {
	return (
		<TextInput
			classNames={{ label: classes.fieldTitle }}
			styles={{ label: { marginBottom: 8 } }}
			label="Endpoint"
			placeholder="Endpoint"
			key="endpoint"
			{...props.form.getInputProps(`${props.targetsPath}.endpoint`)}
		/>
	);
};

type TargetTypeProps = {
	form: AlertsFormType;
	targetsPath: string;
};

const TargetType = (props: TargetTypeProps) => {
	const { form, targetsPath } = props;
	return (
		<Select
			label="Type"
			classNames={{ label: classes.fieldTitle }}
			styles={{ label: { marginBottom: 8 } }}
			data={alertTargets}
			{...form.getInputProps(`${targetsPath}.type`)}
		/>
	);
};

type TLSFieldProps = {
	form: AlertsFormType;
	targetsPath: string;
	skip_tls_check: boolean;
};

const TLSField = (props: TLSFieldProps) => {
	const { form, targetsPath, skip_tls_check } = props;
	return (
		<Stack gap={8}>
			<Text className={classes.fieldTitle}>TLS Check</Text>
			<Checkbox
				style={{ marginTop: 8 }}
				label={!skip_tls_check ? 'Disabled' : 'Enabled'}
				classNames={{ label: classes.fieldTitle }}
				{...form.getInputProps(`${targetsPath}.skip_tls_check`)}
			/>
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

type TargetsSectionProps = {
	form: AlertsFormType;
	alertIndex: number;
	targets: TransformedTarget[];
};

const TargetsSection = (props: TargetsSectionProps) => {
	const { targets, alertIndex, form } = props;
	const addTarget = useCallback(() => {
		form.insertListItem(`alerts.${alertIndex}.targets`, defaultTarget, _.size(targets));
	}, [targets]);
	return (
		<Stack className={classes.fieldsContainer} gap={2} mt={10}>
			<TargetsHeader />
			<Stack>
				{_.map(targets, (target, targetIndex) => {
					const { type, headers = [], skip_tls_check, username = '', password = '' } = target;
					const targetsPath = `alerts.${alertIndex}.targets.${targetIndex}`;
					const specialFieldsConfig = getSpecialFieldsConfig(type);
					const removeTarget = () => {
						form.removeListItem(`alerts.${alertIndex}.targets`, targetIndex);
					};
					return (
						<Stack gap={12} className={classes.targetContainer}>
							<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
									<TargetType form={form} targetsPath={targetsPath} />
									{specialFieldsConfig.tlsField && (
										<TLSField form={form} targetsPath={targetsPath} skip_tls_check={skip_tls_check} />
									)}
								</Stack>
								<IconTrash stroke={1.2} onClick={removeTarget} color="gray" />
							</Stack>
							<Endpointfield form={form} targetsPath={targetsPath} />
							{specialFieldsConfig.authField && (
								<UsernameAndPasswordSection
									targetsPath={targetsPath}
									form={form}
									username={username}
									password={password}
								/>
							)}
							<RepeatConfig form={form} targetsPath={targetsPath} />
							{specialFieldsConfig.headersField && (
								<HeadersSection targetsPath={targetsPath} form={form} headers={headers} />
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

type ColumnRuleProps = {
	form: AlertsFormType;
	alertIndex: number;
	config: ConfigType;
};

const numberInputOnWheelPreventChange = (e: React.WheelEvent<HTMLInputElement>) => {
	// @ts-ignore
	// which event doesnt have a target without blur ?
	e.target.blur();
	e.stopPropagation();
};

const ColumnRule = (props: ColumnRuleProps) => {
	const { form, config, alertIndex } = props;
	const [fieldNames] = useFilterStore((store) => store.fieldNames);
	const [fieldTypeMap] = useFilterStore((store) => store.fieldTypeMap);
	const columnDataType = _.get(fieldTypeMap, [config?.column], null);
	const configPath = `alerts.${alertIndex}.rule.config`;
	useEffect(() => {
		const stringOperatorValues = _.map(stringOperators, (op) => op.value);
		const numericalOperatorValues = _.map(numericalOperators, (op) => op.value);
		const doesOperatorMatch =
			columnDataType === 'text'
				? _.includes(stringOperatorValues, config.operator)
				: _.includes(numericalOperatorValues, config.operator);
		if (!doesOperatorMatch) {
			form.setFieldError(`${configPath}.operator`, 'Invalid operator');
		} else {
			form.clearFieldError(`${configPath}.operator`);
		}

		if (columnDataType === 'text') {
			form.setFieldValue(`${configPath}.ignore_case`, _.isBoolean(config.ignore_case) ? config.ignore_case : true);
		}
	}, [columnDataType, config.operator]);

	const setReapeats = useCallback((val: string) => {
		const path = `${configPath}.repeats`;
		const parsedValue = val === '' ? null : _.toInteger(val);
		form.setFieldValue(path, parsedValue);

		!_.isNumber(parsedValue) || parsedValue < 0
			? form.setFieldError(path, 'Must be a number greater than 0')
			: form.clearFieldError(path);
	}, []);

	const setValue = useCallback(
		(val: string) => {
			const path = `alerts.${alertIndex}.rule.config.value`;
			const parsedValue = columnDataType === 'text' ? val : _.toNumber(val);
			form.setFieldValue(path, parsedValue);
		},
		[columnDataType],
	);

	return (
		<Stack>
			<Stack style={{ flexDirection: 'row' }}>
				<Select
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					label="Column"
					data={fieldNames}
					searchable
					{...form.getInputProps(`alerts.${alertIndex}.rule.config.column`)}
				/>
				<Select
					label="Operator"
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					data={columnDataType === 'text' ? stringOperators : numericalOperators}
					{...form.getInputProps(`alerts.${alertIndex}.rule.config.operator`)}
				/>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					label="Value"
					placeholder="Value"
					key="value"
					type={columnDataType === 'text' ? 'text' : 'number'}
					{...(columnDataType === 'number' ? { onWheel: numberInputOnWheelPreventChange } : {})}
					{...form.getInputProps(`alerts.${alertIndex}.rule.config.value`)}
					onChange={(e) => setValue(e.target.value)}
				/>
			</Stack>
			<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					styles={{ label: { marginBottom: 8 } }}
					label="Repeats"
					placeholder="Repeats"
					key="repeats"
					{...form.getInputProps(`alerts.${alertIndex}.rule.config.repeats`)}
					type={'number'}
					onWheel={numberInputOnWheelPreventChange}
					onChange={(e) => setReapeats(e.target.value)}
				/>
				<Stack gap={8}>
					<Text className={classes.fieldTitle} style={{ marginBottom: 8 }}>
						Case sensitive
					</Text>
					<Checkbox
						label={config.ignore_case ? 'Ignored' : 'Enabled'}
						styles={{ label: { marginBottom: 8 } }}
						classNames={{ label: classes.fieldTitle }}
						key="ignore_case"
						{...form.getInputProps(`alerts.${alertIndex}.rule.config.ignore_case`)}
						{...(columnDataType === 'text' ? {} : { disabled: true, checked: true })}
						onChange={(e) => {
							form.setFieldValue(`${configPath}.ignore_case`, e.target.checked);
						}}
						// value={!!config.ignore_case}
					/>
				</Stack>
			</Stack>
		</Stack>
	);
};

type CompositeColumnConfigProps = {
	form: AlertsFormType;
	alertIndex: number;
};

const CompositeColumnConfig = (props: CompositeColumnConfigProps) => {
	const { form, alertIndex } = props;
	return (
		<TextInput
			classNames={{ label: classes.fieldTitle }}
			styles={{ label: { marginBottom: 8 } }}
			label="Config"
			placeholder="Config"
			key="config"
			{...form.getInputProps(`alerts.${alertIndex}.rule.config`)}
		/>
	);
};

type RuleSectionHeaderProps = {
	form: AlertsFormType;
	alertIndex: number;
};

const RuleSectionHeader = (props: RuleSectionHeaderProps) => {
	const { form, alertIndex } = props;
	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
			<Stack gap={0} w="50%">
				<Text className={classes.fieldTitle}>Rule</Text>
				<Text className={classes.fieldDescription}>Description for rule</Text>
			</Stack>
			<Select
				w="30%"
				data={[columnRuleType, compositeRuleType]}
				{...form.getInputProps(`alerts.${alertIndex}.rule.type`)}
			/>
		</Stack>
	);
};

type AlertNameProps = {
	form: AlertsFormType;
	alertIndex: number;
};

const AlertName = (props: AlertNameProps) => {
	const { form, alertIndex } = props;
	return (
		<TextInput
			classNames={{ label: classes.fieldTitle }}
			styles={{ label: { marginBottom: 8 } }}
			label="Name"
			placeholder="Name"
			key="name"
			{...form.getInputProps(`alerts.${alertIndex}.name`)}
		/>
	);
};

type AlertMessageProps = {
	form: AlertsFormType;
	alertIndex: number;
};

const AlertMessage = (props: AlertMessageProps) => {
	const { form, alertIndex } = props;
	return (
		<TextInput
			classNames={{ label: classes.fieldTitle }}
			styles={{ label: { marginBottom: 8 } }}
			label="Message"
			placeholder="Message"
			key="message"
			{...form.getInputProps(`alerts.${alertIndex}.message`)}
		/>
	);
};

type AlertsFormType = UseFormReturnType<TransformedAlerts, (values: TransformedAlerts) => TransformedAlerts>;

type AlertsSectionProps = {
	alert: TransformedAlert;
	index: number;
	form: AlertsFormType;
};

const AlertSection = (props: AlertsSectionProps) => {
	const { index, alert, form } = props;
	const {
		name,
		rule: { type, config },
		targets,
	} = alert;
	const [opened, setOpened] = useState(true);
	const toggleOpen = useCallback(() => {
		return setOpened((prev) => !prev);
	}, []);

	useEffect(() => {
		const configPath = `alerts.${index}.rule.config`;
		if (type === columnRuleType && !_.isObject(config)) {
			form.setFieldValue(`${configPath}`, defaultColumnTypeRule);
		} else if (type === compositeRuleType && !_.isString(config)) {
			form.setFieldValue(`${configPath}`, '');
		}
	}, [type]);

	const deleteAlert = useCallback(() => {
		form.removeListItem('alerts', index);
	}, []);

	return (
		<Stack className={classes.alertSection}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', cursor: 'pointer' }} onClick={toggleOpen}>
				<Text style={{ fontWeight: 400, fontsiz: '1rem' }} lineClamp={1}>
					{_.isEmpty(name) ? 'Unnamed Alert' : name}
				</Text>
				<Stack style={{ flexDirection: 'row' }}>
					<IconTrash onClick={deleteAlert} stroke={1.2} color="gray" />
					{opened ? <IconChevronUp stroke={1.2} color="gray" /> : <IconChevronDown stroke={1.2} color="gray" />}
				</Stack>
			</Stack>
			{opened && (
				<Stack gap={8}>
					<AlertName alertIndex={index} form={form} />
					<AlertMessage form={form} alertIndex={index} />
					<Stack className={classes.fieldsContainer} gap={2} mt={10}>
						<RuleSectionHeader form={form} alertIndex={index} />
						{type === 'column' ? (
							<ColumnRule form={form} config={config} alertIndex={index} />
						) : (
							<CompositeColumnConfig form={form} alertIndex={index} />
						)}
					</Stack>
					<TargetsSection form={form} targets={targets} alertIndex={index} />
				</Stack>
			)}
		</Stack>
	);
};

// const getTargetPresets = (alerts) => {
// 	const presets = {
// 		alertmanager: { endpoints: [], usernames: [], passwords: [], repeatIntervals: [], repeatTimes: [] },
// 		slack: {endpoints: [], repeatIntervals: [], repeatTimes: []},
// 		webhook: {endpoints: [], repeatIntervals: [], repeatTimes: [], headers: [], headerValues: []}
// 	};
// 	_.map(alerts, alert => {
// 		const {type} = alert;
// 		if (_.isEmpty(type)) return;

// 		if (type === "alertmanager") {
// 			const {endpoints, usernames, passwords, repeatIntervals, repeatTimes} = presets.alertmanager;
// 			const {endpoint = '', username= '', password= '', repeat: {}} = alert;
// 			const {interval: repeatInterval, times: repeatTime} = repeat;

// 			presets.alertmanager = {
// 				endpoints: [...endpoints, endpoint],
// 				usernames: [...usernames, username],
// 				passwords: [...passwords, password],
// 				repeatIntervals: [...repeatIntervals, repeatInterval],
// 				repeatTimes: []
// 			}
// 		}
// 	})
// }

const AlertsForm = ({ form }: { form: AlertsFormType }) => {
	const [alerts] = useLogsStore((store) => store.alerts);
	const totalAlertsInForm = _.size(form.values.alerts);

	useEffect(() => {
		form.setValues(alerts);
	}, [alerts]);

	const addNewAlert = useCallback(() => {
		form.insertListItem('alerts', defaultAlert, totalAlertsInForm);
	}, [totalAlertsInForm]);

	return (
		<Stack gap={0}>
			{_.map(form.values.alerts, (alert, index) => {
				return <AlertSection alert={alert} index={index} key={index} form={form} />;
			})}
			<Stack style={{ alignItems: 'flex-start' }}>
				<Box mt={8} mb={16}>
					<Button
						className={classes.formBtn}
						variant="outline"
						onClick={addNewAlert}
						leftSection={<IconPlus stroke={1.2} />}>
						New Alert
					</Button>
				</Box>
			</Stack>
		</Stack>
	);
};

const AlertsModal = () => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [alertsModalOpen, setLogsStore] = useLogsStore((store) => store.modalOpts.alertsModalOpen);
	const { form } = useCreateAlertsForm();

	const onCloseModal = useCallback(() => {
		setLogsStore((store) => toggleAlertsModal(store, false));
	}, []);

	const { getLogAlertData, getLogAlertDataRefetch } = useGetAlerts(currentStream || '');
	const { updateLogStreamAlerts } = useAlertsEditor(currentStream || '');

	const onSuccess = useCallback(() => {
		onCloseModal();
		getLogAlertDataRefetch();
	}, []);

	useEffect(() => {
		if (getLogAlertData?.data) {
			setLogsStore((store) => setAlerts(store, getLogAlertData?.data));
		}
	}, [getLogAlertData?.data]);

	const onSubmit = useCallback(() => {
		const { hasErrors } = form.validate();

		if (hasErrors) {
			return notifyError({ message: 'Please resolve the errors in the form' });
		}
		const parsedAlerts = transformAlerts(form.values.alerts);
		updateLogStreamAlerts({ config: { ...form.values, alerts: parsedAlerts }, onSuccess: onSuccess });
	}, [form]);

	const onResetAllAlerts = useCallback(() => {
		updateLogStreamAlerts({ config: { ...form.values, alerts: [] }, onSuccess: onSuccess });
	}, []);

	return (
		<Modal
			opened={alertsModalOpen}
			onClose={onCloseModal}
			centered
			size="lg"
			title="Alerts"
			styles={{ body: { padding: '0 1rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			classNames={{ title: classes.modalTitle }}>
			<Stack gap={0}>
				<Stack mih={400}>
					<AlertsForm form={form} />
				</Stack>
				<Stack style={{ flexDirection: 'row', marginBottom: '1.2rem', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={onResetAllAlerts} variant="outline">
							Reset All Alerts
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

export default AlertsModal;
