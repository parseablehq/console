import {
	ActionIcon,
	Box,
	Button,
	CloseIcon,
	Divider,
	FileInput,
	JsonInput,
	Loader,
	Modal,
	NumberInput,
	Select,
	Stack,
	Switch,
	TagsInput,
	Text,
	TextInput,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './styles/CreateStreamModal.module.css';
import { useLogStream } from '@/hooks/useLogStream';
import { useForm } from '@mantine/form';
import { IconInfoCircleFilled, IconPlus } from '@tabler/icons-react';
import _ from 'lodash';
import { CreatableSelect } from '@/components/Misc/CreatableSelect';
import { useAppStore, appStoreReducers } from '@/layouts/MainLayout/providers/AppProvider';
import { GetInputPropsReturnType, UseFormReturnType } from 'node_modules/@mantine/form/lib/types';
import { notifyError } from '@/utils/notification';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';

const { toggleCreateStreamModal } = appStoreReducers;

const allowedSpecialCharacters = ['-', '_'];

const isValidStreamName = (val: string) => {
	if (!/[A-Za-z]/.test(val)) {
		return 'Name should contain at least one letter';
	} else if (/\s/.test(val)) {
		return 'Name should not contain whitespace';
	} else if (!new RegExp(`^[a-zA-Z0-9${allowedSpecialCharacters.join('')}\]+$`).test(val)) {
		return `Name should only contain letters, numbers, or these special characters: ${allowedSpecialCharacters.join(
			' , ',
		)}`;
	}

	return null;
};

const reservedFieldNames = ['p_metadata', 'p_tags', 'p_timestamp'];

const isValidFieldName = (val: string, existingNames: string[]) => {
	if (val.length === 0) {
		return 'Name cannot be empty';
	} else if (_.includes(reservedFieldNames, val)) {
		return `${val} is a reserved field`;
	} else if (_.filter(existingNames, (name) => name === val).length > 1) {
		return 'Name already exists';
	} else {
		return null;
	}
};

const datatypes = [
	{ value: 'int', label: 'Int' },
	{ value: 'float', label: 'Float' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'string', label: 'String' },
	{ value: 'datetime', label: 'Datetime' },
	{ value: 'string_list', label: 'String list' },
	{ value: 'int_list', label: 'Int list' },
	{ value: 'float_list', label: 'Float list' },
	{ value: 'boolean_list', label: 'Boolean list' },
];

const formValuesDatatypeMap = {
	Boolean: 'boolean',
	Float64: 'float',
	Int64: 'int',
	Utf8: 'string',
};

const formValuesListDatatypeMap = {
	Boolean: 'boolean_list',
	Float64: 'float_list',
	Int64: 'int_list',
	Utf8: 'string_list',
};

const getDataTypeFormValuesFromSchema = (schema: LogStreamSchemaData) => {
	const { fields } = schema;
	return _.reduce(
		fields,
		(acc: { name: string; data_type: string }[], field) => {
			const { data_type: detectedDataType, name } = field;
			const data_type = (() => {
				if (_.isString(detectedDataType)) {
					return _.get(formValuesDatatypeMap, detectedDataType, null);
				} else {
					if (_.get(detectedDataType, 'List')) {
						const listDatatype = _.get(detectedDataType, 'List', null);
						// @ts-ignore
						return listDatatype ? _.get(formValuesListDatatypeMap, listDatatype?.data_type, null) : null;
					} else if (_.get(detectedDataType, 'Timestamp')) {
						return 'datetime';
					} else {
						return acc;
					}
				}
			})();
			return data_type ? [...acc, { name, data_type }] : acc;
		},
		[],
	);
};

const defaultPartitionField = 'p_timestamp (Default)';
const staticType = 'Static';
const dynamicType = 'Dynamic';

const FieldRow = (props: {
	nameInputProps: GetInputPropsReturnType;
	datatypeInputProps: GetInputPropsReturnType;
	onRemove: null | (() => void);
}) => {
	const rmvBtnProps = _.isFunction(props.onRemove) ? { onClick: props.onRemove } : { color: 'gray' };
	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
			<TextInput w="47%" withAsterisk placeholder="Field name" key="name" {...props.nameInputProps} />
			<Select w="47%" placeholder="Select Datatype" data={datatypes} {...props.datatypeInputProps} />
			<Stack w="6%" style={{ alignItems: 'center', paddingTop: 4 }}>
				<ActionIcon className={styles.deleteRulebtn} variant="light" {...rmvBtnProps}>
					<CloseIcon />
				</ActionIcon>
			</Stack>
		</Stack>
	);
};

const defaultFieldValue = { name: '', data_type: datatypes[0].value };

const AddFieldButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Box>
			<Button
				variant="outline"
				leftSection={
					<ThemeIcon size="xs" p={0} variant="outline" m={0} style={{ border: 0 }}>
						<IconPlus stroke={2} />
					</ThemeIcon>
				}
				onClick={onClick}>
				Add Field
			</Button>
		</Box>
	);
};

const SchemaTypeField = (props: { inputProps: GetInputPropsReturnType }) => {
	return (
		<Stack gap={2} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<Stack gap={1}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
					<Text className={styles.fieldTitle}>Schema Type</Text>
					<Tooltip
						multiline
						w={220}
						withArrow
						transitionProps={{ duration: 200 }}
						label="Dynamic schema allows new fields to be added to a stream later. Static schema is fixed for the lifetime of the stream.">
						<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={14} width={14} />
					</Tooltip>
				</Stack>
				<Text className={styles.fieldDescription}>Choose dynamic or static schema</Text>
			</Stack>
			<Select w={200} data={[dynamicType, staticType]} {...props.inputProps} />
		</Stack>
	);
};

const PartitionLimitField = (props: { inputProps: GetInputPropsReturnType }) => {
	return (
		<Stack gap={2} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<Stack gap={1}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
					<Text className={styles.fieldTitle}>Maximum Historical Difference</Text>
					<Tooltip
						multiline
						w={220}
						withArrow
						transitionProps={{ duration: 200 }}
						label="Maximum difference between current server time and timestamp in the custom time partition field">
						<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={14} width={14} />
					</Tooltip>
				</Stack>
				<Text className={styles.fieldDescription}>Default limit is set to 30 days</Text>
			</Stack>
			<NumberInput
				w={200}
				styles={{ section: { '--section-size': 'none', padding: 12 } }}
				{...props.inputProps}
				rightSection={<Text>Days</Text>}
			/>
		</Stack>
	);
};

const PartitionField = (props: {
	partitionFields: string[];
	onChangeValue: (key: string, field: string) => void;
	isStaticSchema: boolean;
	error: string;
	value: string;
}) => {
	const [data, setData] = useState<string[]>([]);
	useEffect(() => {
		setData(_.uniq([...props.partitionFields]));
	}, [props.partitionFields]);

	const onFieldChange = useCallback((value: string) => {
		return props.onChangeValue('partitionField', value);
	}, []);

	useEffect(() => {
		setData(props.partitionFields);
		onFieldChange(defaultPartitionField);
	}, [props.isStaticSchema]);

	return (
		<Stack gap={2} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<Stack gap={1}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
					<Text className={styles.fieldTitle}>Time Partition Field</Text>
					<Tooltip
						multiline
						w={220}
						withArrow
						transitionProps={{ duration: 200 }}
						label="This allows querying events based on custom timestamp selected here.">
						<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={14} width={14} />
					</Tooltip>
				</Stack>
				<Text className={styles.fieldDescription}>Select the time field to partition log events</Text>
			</Stack>
			<CreatableSelect
				data={data}
				setData={setData}
				value={props.value}
				setValue={(value: string) => onFieldChange(value)}
				placeholder="Select or Add"
				error={props.error}
				style={{ width: 200 }}
			/>
		</Stack>
	);
};

const CustomPartitionField = (props: {
	partitionFields: string[];
	onChangeValue: (key: string, field: string[]) => void;
	isStaticSchema: boolean;
	error: string;
	value: string[];
}) => {
	const shouldDisable = _.isEmpty(props.partitionFields);

	return (
		<Stack gap={2} style={{ justifyContent: 'space-between' }}>
			<Stack gap={1}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
					<Text className={styles.fieldTitle}>Custom Partition Field</Text>
					<Tooltip
						multiline
						w={220}
						withArrow
						transitionProps={{ duration: 200 }}
						label="Partition data storage based on fields and their values">
						<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={14} width={14} />
					</Tooltip>
				</Stack>
				<Text className={styles.fieldDescription}>Select 3 columns to partition the events</Text>
			</Stack>
			<TagsInput
				placeholder={
					props.isStaticSchema
						? shouldDisable
							? 'Add Columns to the Schema'
							: 'Select column from the list'
						: 'Add upto 3 columns'
				}
				data={props.partitionFields}
				mt={6}
				onChange={(val) => props.onChangeValue('customPartitionFields', val)}
				maxTags={3}
				error={props.error}
			/>
		</Stack>
	);
};

type FieldType = {
	data_type: string;
	name: string;
};

const getDateTimeFieldNames = (fields: FieldType[]) => {
	return _.chain(fields)
		.filter((field) => field.data_type === 'datetime' && field.name.length > 0)
		.map((field) => field.name)
		.uniq()
		.value();
};

type StreamFormType = UseFormReturnType<Stream, (values: Stream) => Stream>;

type Stream = {
	name: string;
	fields: {
		name: string;
		data_type: string;
	}[];
	schemaType: string;
	partitionField: string;
	partitionLimit: number;
	customPartitionFields: never[];
};

const useCreateStreamForm = () => {
	const form: StreamFormType = useForm({
		mode: 'controlled',
		initialValues: {
			name: '',
			fields: [defaultFieldValue],
			schemaType: dynamicType,
			partitionField: defaultPartitionField,
			partitionLimit: 30,
			customPartitionFields: [],
		},
		validate: {
			name: (value) => isValidStreamName(value),
			fields: {
				name: (val, allValues) => {
					if (allValues.schemaType === dynamicType) return null;

					const { fields } = allValues;
					const existingNames = _.map(fields, (v) => v.name);
					return isValidFieldName(val, existingNames);
				},
				data_type: (val, allValues) => {
					if (allValues.schemaType === dynamicType) return null;

					const allowedValues = _.map(datatypes, (datatype) => datatype.value);
					return _.includes(allowedValues, val) ? null : 'Invalid datatype';
				},
			},
			partitionField: (val, allValues) => {
				const { fields, schemaType } = allValues;
				const allDateTimeFields = getDateTimeFieldNames(fields);
				if (val === defaultPartitionField) return null;

				return schemaType === staticType && !_.includes(allDateTimeFields, val) ? 'Unknown Field' : null;
			},
			schemaType: (val) => (_.includes([dynamicType, staticType], val) ? null : 'Choose either Dynamic or Static'),
			customPartitionFields: (val, allValues) => {
				if (_.isEmpty(val) || allValues.schemaType !== staticType) {
					return null;
				} else {
					const allFieldNames = _.map(allValues.fields, (field) => field.name);
					const invalidColumnNames = _.difference(val, allFieldNames);
					return !_.isEmpty(invalidColumnNames) ? 'Unknown Field Included' : null;
				}
			},
			partitionLimit: (val) => (!_.isInteger(val) ? 'Must be a number' : null),
		},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	useEffect(() => {
		if (form.values.schemaType === staticType) {
			form.validateField('partitionField');
		}
	}, [form.values.fields]);

	const onAddField = useCallback(() => {
		form.insertListItem('fields', defaultFieldValue);
	}, []);

	const onRemoveField = useCallback((index: number) => {
		form.removeListItem('fields', index);
	}, []);

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
		form.validateField(key);
	}, []);

	return { form, onAddField, onRemoveField, onChangeValue };
};

const DetectSchemaSection = (props: { form: StreamFormType }) => {
	const [file, setFile] = useState<File | null>(null);
	const { detectLogStreamSchemaMutation, detectLogStreamSchemaIsLoading: isDetecting } = useLogStream();
	const [jsonInputValue, setJsonInputValue] = useState('');
	const [showAutoDetectInputs, setShowAutoDetectInputs] = useState(false);

	const updateFields = useCallback(
		(schema: LogStreamSchemaData) => {
			const updatedFormFields = getDataTypeFormValuesFromSchema(schema);
			props.form.setFieldValue('fields', updatedFormFields);
			props.form.validate();
		},
		[props.form],
	);

	const onImportFile = (file: File | null) => {
		if (file) {
			setFile(file);
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				try {
					const target = e.target;
					if (target === null || typeof target.result !== 'string') {
						return notifyError({ message: 'Unable to parse the file!' });
					} else {
						return setJsonInputValue(target.result);
					}
				} catch (error) {
					return notifyError({ message: 'Unable to parse the file!' });
				}
			};
			reader.readAsText(file);
		}
	};

	const detectSchemaHandler = useCallback(() => {
		let logRecords;
		try {
			logRecords = JSON.parse(jsonInputValue);
		} catch (e) {
			console.error('Error parsing json', e);
		}
		if (!_.isArray(logRecords)) {
			return notifyError({ message: 'Invalid JSON' });
		} else if (_.isEmpty(logRecords)) {
			return notifyError({ message: 'No records found' });
		} else if (_.size(logRecords) > 10) {
			return notifyError({ message: 'More than 10 records found' });
		} else {
			detectLogStreamSchemaMutation({ sampleLogs: logRecords, onSuccess: updateFields });
		}
	}, [jsonInputValue]);

	return (
		<Stack gap={12}>
			<Stack gap={2} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Stack gap={1}>
					<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
						<Text className={styles.fieldTitle}>Auto Detect Fields and Datatype</Text>
						<Tooltip
							multiline
							w={220}
							withArrow
							transitionProps={{ duration: 200 }}
							label="Upload a JSON with array of records. We will auto detect the fields and datatype for each field">
							<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={14} width={14} />
						</Tooltip>
					</Stack>
					<Text className={styles.fieldDescription}>Enable to generate schema based on log records</Text>
				</Stack>
				<Stack>
					<Switch
						checked={showAutoDetectInputs}
						onChange={(event) => setShowAutoDetectInputs(event.currentTarget.checked)}
					/>
				</Stack>
			</Stack>
			<Stack
				style={{ marginBottom: showAutoDetectInputs ? '0.4rem' : 0, display: showAutoDetectInputs ? 'flex' : 'none' }}>
				<FileInput
					placeholder="Import JSON"
					value={file}
					disabled={isDetecting}
					onChange={onImportFile}
					fileInputProps={{ accept: '.json' }}
				/>
				<Divider label="or" />
				<JsonInput
					placeholder="Array of Log Records as JSON"
					validationError="Invalid JSON"
					autosize
					minRows={4}
					disabled={isDetecting}
					maxRows={6}
					formatOnBlur
					value={jsonInputValue}
					onChange={setJsonInputValue}
				/>

				<Stack style={{ alignItems: 'flex-end' }}>
					<Box>
						<Button
							disabled={_.isEmpty(jsonInputValue)}
							onClick={detectSchemaHandler}
							loading={isDetecting}
							variant="outline">
							Submit
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

const CreateStreamForm = (props: { toggleModal: () => void }) => {
	const { form, onAddField, onRemoveField, onChangeValue } = useCreateStreamForm();
	const stringFields = getDateTimeFieldNames(form.values.fields);
	const isStaticSchema = form.values.schemaType === staticType;
	const partitionFields = [defaultPartitionField, ...(isStaticSchema ? stringFields : [])];
	const customPartitionFields = !isStaticSchema
		? []
		: _.chain(form.values.fields)
				.map((field) => field.name)
				.uniq()
				.compact()
				.value();
	const { createLogStreamMutation, createLogStreamIsLoading } = useLogStream();
	const { getLogStreamListRefetch } = useLogStream();
	const onSuccessCallback = useCallback(() => {
		props.toggleModal();
		getLogStreamListRefetch();
	}, []);

	const onSubmit = useCallback(() => {
		const { hasErrors } = form.validate();
		const { schemaType, fields, partitionField, customPartitionFields, partitionLimit } = form.values;
		const isStatic = schemaType === staticType;
		if (hasErrors || (isStatic && _.isEmpty(fields))) return;

		const headers = {
			...(partitionField !== defaultPartitionField ? { 'X-P-Time-Partition': partitionField } : {}),
			...(isStatic ? { 'X-P-Static-Schema-Flag': true } : {}),
			...(_.isEmpty(customPartitionFields) ? {} : { 'X-P-Custom-Partition': _.join(customPartitionFields, ',') }),
			...(partitionField === defaultPartitionField || !_.isInteger(partitionLimit)
				? {}
				: { 'X-P-Time-Partition-Limit': `${partitionLimit}d` }),
		};
		const schmaFields = isStatic ? fields : {};
		createLogStreamMutation({
			streamName: form.values.name,
			fields: schmaFields,
			headers,
			onSuccess: onSuccessCallback,
		});
	}, [form.values]);

	return (
		<Stack>
			<TextInput
				withAsterisk
				classNames={{ label: styles.fieldTitle }}
				styles={{ label: { marginBottom: 8 } }}
				label="Name"
				placeholder="Name"
				key="name"
				{...form.getInputProps('name')}
			/>
			<SchemaTypeField inputProps={form.getInputProps('schemaType')} />
			{isStaticSchema && <DetectSchemaSection form={form} />}
			{isStaticSchema && (
				<Stack className={styles.fieldsSectionContainer}>
					<Text className={styles.fieldTitle}>Fields</Text>
					<Stack className={styles.fieldsContainer}>
						{_.map(form.values.fields, (_field, index) => {
							const nameInputProps = form.getInputProps(`fields.${index}.name`);
							const datatypeInputProps = form.getInputProps(`fields.${index}.data_type`);
							const onRemove = _.size(form.values.fields) <= 1 ? null : () => onRemoveField(index);
							return <FieldRow key={index} {...{ nameInputProps, datatypeInputProps, onRemove }} />;
						})}
						<AddFieldButton onClick={onAddField} />
					</Stack>
				</Stack>
			)}
			<PartitionField
				partitionFields={partitionFields}
				isStaticSchema={isStaticSchema}
				onChangeValue={onChangeValue}
				value={form.values.partitionField}
				error={_.toString(form.errors.partitionField)}
			/>
			{form.values.partitionField !== defaultPartitionField && (
				<PartitionLimitField inputProps={form.getInputProps('partitionLimit')} />
			)}
			<CustomPartitionField
				partitionFields={customPartitionFields}
				isStaticSchema={isStaticSchema}
				onChangeValue={onChangeValue}
				value={form.values.customPartitionFields}
				error={_.toString(form.errors.customPartitionFields)}
			/>
			<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
				<Box>
					{!createLogStreamIsLoading ? (
						<Button w="6rem" onClick={onSubmit} disabled={!_.isEmpty(form.errors)}>
							Create
						</Button>
					) : (
						<Button w="6rem">
							{' '}
							<Loader size="sm" color="white" />
						</Button>
					)}
				</Box>
			</Stack>
		</Stack>
	);
};

const CreateStreamModal: FC = () => {
	const classes = styles;
	const [createStreamModalOpen, setAppStore] = useAppStore((store) => store.createStreamModalOpen);
	const { container, aboutTitle } = classes;
	const closeModal = useCallback(() => {
		setAppStore((store) => toggleCreateStreamModal(store, false));
	}, []);

	return (
		<Modal
			opened={createStreamModalOpen}
			onClose={closeModal}
			withinPortal
			size="xl"
			centered
			padding={20}
			title="Create Stream"
			classNames={{ title: aboutTitle }}>
			<Stack className={container}>
				<CreateStreamForm toggleModal={closeModal} />
			</Stack>
		</Modal>
	);
};

export default CreateStreamModal;
