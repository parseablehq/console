import {
	ActionIcon,
	Box,
	Button,
	CloseIcon,
	Modal,
	Select,
	Stack,
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
import { GetInputPropsReturnType } from 'node_modules/@mantine/form/lib/types';

const { toggleCreateStreamModal } = appStoreReducers;

const isValidStreamName = (val: string) => {
	if (!/[A-Za-z]/.test(val)) {
		return 'Name should contain atleast one letter';
	} else if (_.includes(val, ' ')) {
		return 'Name should not contain whitespace';
	} else if (!/^[a-zA-Z0-9]+$/.test(val)) {
		return 'Name should not contain any special characters';
	} else {
		null;
	}
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
	{ value: 'double', label: 'Double' },
	{ value: 'float', label: 'Float' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'string', label: 'String' },
	{ value: 'datetime', label: 'Datetime' },
	{ value: 'string_list', label: 'String list' },
	{ value: 'int_list', label: 'Int list' },
	{ value: 'double_list', label: 'Double list' },
	{ value: 'float_list', label: 'Float list' },
	{ value: 'boolean_list', label: 'Boolean list' },
];

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
				onClick={onClick}
				style={{ padding: 12, fontSize: '0.8rem' }}>
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
						<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={18} width={18} />
					</Tooltip>
				</Stack>
				<Text className={styles.fieldDescription}>Choose dynamic, evolving schema or fixed, static schema.</Text>
			</Stack>
			<Select data={[dynamicType, staticType]} {...props.inputProps} />
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
		setData((prev) => _.uniq([...prev, ...props.partitionFields]));
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
					<Text className={styles.fieldTitle}>Partition Field</Text>
					<Tooltip
						multiline
						w={220}
						withArrow
						transitionProps={{ duration: 200 }}
						label="This allows querying events based on custom timestamp selected here.">
						<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={18} width={18} />
					</Tooltip>
				</Stack>
				<Text className={styles.fieldDescription}>Select the time column to partition log events.</Text>
			</Stack>
			<CreatableSelect
				data={data}
				setData={setData}
				value={props.value}
				setValue={(value: string) => onFieldChange(value)}
				placeholder="Select or Add"
				error={props.error}
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
						label="This allows querying events based on custom timestamp selected here.">
						<IconInfoCircleFilled className={styles.infoTooltipIcon} stroke={1.4} height={18} width={18} />
					</Tooltip>
				</Stack>
				<Text className={styles.fieldDescription}>Upto 3 columns</Text>
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

const getStringFieldNames = (fields: FieldType[]) => {
	return _.chain(fields)
		.filter((field) => field.data_type === 'string' && field.name.length > 0)
		.map((field) => field.name)
		.uniq()
		.value();
};

const useCreateStreamForm = () => {
	const form = useForm({
		mode: 'controlled',
		initialValues: {
			name: '',
			fields: [defaultFieldValue],
			schemaType: dynamicType,
			partitionField: defaultPartitionField,
			customPartitionFields: [],
		},
		validate: {
			name: (value) => isValidStreamName(value),
			fields: {
				name: (val, allValues) => {
					if (allValues.schemaType === dynamicType) return null;

					const { fields } = allValues;
					const existingNames = _.map(fields, (v, _k) => v.name);
					return isValidFieldName(val, existingNames);
				},
			},
			partitionField: (val, allValues) => {
				const { fields, schemaType } = allValues;
				const allStringFieldNames = getStringFieldNames(fields);
				if (val === defaultPartitionField) return null;

				return schemaType === staticType && !_.includes(allStringFieldNames, val) ? 'Unknown Field' : null;
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

const CreateStreamForm = (props: { toggleModal: () => void }) => {
	const { form, onAddField, onRemoveField, onChangeValue } = useCreateStreamForm();
	const stringFields = getStringFieldNames(form.values.fields);
	const isStaticSchema = form.values.schemaType === staticType;
	const partitionFields = [defaultPartitionField, ...(isStaticSchema ? stringFields : [])];
	const customPartitionFields = !isStaticSchema
		? []
		: _.chain(form.values.fields)
				.map((field) => field.name)
				.compact()
				.value();
	const { createLogStreamMutation } = useLogStream();
	const { getLogStreamListRefetch } = useLogStream();
	const onSuccessCallback = useCallback(() => {
		props.toggleModal();
		getLogStreamListRefetch();
	}, []);

	const onSubmit = useCallback(() => {
		const { hasErrors } = form.validate();
		const { schemaType, fields, partitionField, customPartitionFields } = form.values;
		const isStatic = schemaType === staticType;
		if (hasErrors || (isStatic && _.isEmpty(fields))) return;

		const headers = {
			...(partitionField !== defaultPartitionField ? { 'X-P-Time-Partition': partitionField } : {}),
			...(isStatic ? { 'X-P-Static-Schema-Flag': true } : {}),
			...(_.isEmpty(customPartitionFields) ? {} : { 'X-P-Custom-Partition': _.join(customPartitionFields, ',') }),
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
			{isStaticSchema && (
				<Stack className={styles.fieldsContainer}>
					<Text className={styles.fieldTitle}>Fields</Text>
					{_.map(form.values.fields, (_field, index) => {
						const nameInputProps = form.getInputProps(`fields.${index}.name`);
						const datatypeInputProps = form.getInputProps(`fields.${index}.data_type`);
						const onRemove = _.size(form.values.fields) <= 1 ? null : () => onRemoveField(index);
						return <FieldRow {...{ nameInputProps, datatypeInputProps, onRemove }} />;
					})}
					<AddFieldButton onClick={onAddField} />
				</Stack>
			)}
			<PartitionField
				partitionFields={partitionFields}
				isStaticSchema={isStaticSchema}
				onChangeValue={onChangeValue}
				value={form.values.partitionField}
				error={_.toString(form.errors.partitionField)}
			/>
			<CustomPartitionField
				partitionFields={customPartitionFields}
				isStaticSchema={isStaticSchema}
				onChangeValue={onChangeValue}
				value={form.values.customPartitionFields}
				error={_.toString(form.errors.customPartitionFields)}
			/>
			<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
				<Box>
					<Button onClick={onSubmit}>Create</Button>
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
			size="lg"
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
