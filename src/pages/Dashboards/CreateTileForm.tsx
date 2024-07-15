import { Box, Button, Select, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/Form.module.css';
import { useForm, UseFormReturnType } from '@mantine/form';
import { Tile } from './providers/DashboardsProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { SchemaList } from '../Stream/components/Querier/QueryCodeEditor';
import { getLogStreamSchema } from '@/api/logStream';
import { Field } from '@/@types/parseable/dataType';
import { Editor } from '@monaco-editor/react';
import VizEditorModal from './VizEditorModal';

const SectionHeader = (props: { title: string }) => {
	return (
		<Stack className={classes.sectionHeader}>
			<Text style={{ fontSize: '0.725rem', fontWeight: 500 }}>{props.title}</Text>
		</Stack>
	);
};

const VisPreview = () => {
	return (
		<Stack className={classes.sectionContainer}>
			<SectionHeader title="Visualization Preview" />
		</Stack>
	);
};

const DataPreview = () => {
	return (
		<Stack className={classes.sectionContainer}>
			<SectionHeader title="Data Preview" />
		</Stack>
	);
};

interface FormOpts extends Omit<Tile, 'id'> {}

const useTileForm = (opts: FormOpts) => {
	const form = useForm<FormOpts>({
		mode: 'controlled',
		initialValues: opts,
		validate: {},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
	}, []);

	return { form, onChangeValue };
};

type TileFormType = UseFormReturnType<FormOpts, (values: FormOpts) => FormOpts>;

const fetchStreamFields = async (stream: string, setFields: (fields: Field[]) => void) => {
	try {
		const res = await getLogStreamSchema(stream);
		setFields(res.data.fields);
	} catch {
		setFields([]);
	}
};

const Config = (props: { form: TileFormType }) => {
	const { form } = props;
	const { stream } = form.getValues();
	const [fields, setFields] = useState<Field[]>([]);
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const allStreams = useMemo(
		() => _.map(userSpecificStreams, (stream) => ({ label: stream.name, value: stream.name })),
		[userSpecificStreams],
	);

	useEffect(() => {
		setFields([]);
		if (_.size(stream) > 0) {
			fetchStreamFields(stream, (fields: Field[]) => setFields(fields));
		}
	}, [stream]);

	return (
		<Stack className={classes.sectionContainer} style={{ height: '100%' }}>
			<SectionHeader title="Tile Config" />
			<Stack style={{ flexDirection: 'row', alignItems: 'center', padding: '0 1rem' }}>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					label="Name"
					placeholder="Tile Name"
					key="name"
					{...form.getInputProps('name')}
					style={{ width: '50%' }}
				/>
				<Select
					data={allStreams}
					classNames={{ label: classes.fieldTitle }}
					label="Stream"
					placeholder="Stream"
					key="stream"
					{...form.getInputProps('stream')}
					style={{ width: '50%' }}
				/>
			</Stack>
			<Stack style={{ padding: '0 1rem' }}>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					label="Description"
					placeholder="Tile Description (Optional)"
					key="description"
					{...form.getInputProps('description')}
				/>
			</Stack>
			<Stack style={{ padding: '0 1rem' }} gap={4}>
				<Text className={classes.fieldTitle}>Query</Text>
				<Stack className={classes.queryCodeContainer}>
					<Box style={{ marginBottom: 8 }}>
						{true ? (
							<Stack gap={0} style={{ flexDirection: 'row', width: '100%' }}>
								<TextInput
									type="text"
									name="ai_query"
									id="ai_query"
									value={''}
									// onChange={(e) => setAiQuery(e.target.value)}
									placeholder="Enter plain text to generate SQL query using OpenAI"
									style={{ flex: 1 }}
								/>
								<Button variant="filled" color="brandPrimary.4" radius={0} onClick={() => {}}>
									✨ Generate
								</Button>
							</Stack>
						) : (
							<Box style={{ width: '100%' }}>
								<Box component="a" href="https://www.parseable.com/docs/integrations/llm" target="_blank">
									Know More: How to enable SQL generation with OpenAI ?
								</Box>
							</Box>
						)}
					</Box>
					<SchemaList currentStream={stream} fields={fields} />
					<Editor
						defaultLanguage="sql"
						value={''}
						onChange={() => {}}
						options={{
							scrollBeyondLastLine: false,
							readOnly: false,
							fontSize: 10,
							wordWrap: 'on',
							minimap: { enabled: false },
							automaticLayout: true,
							mouseWheelZoom: true,
							padding: { top: 8 },
						}}
						// onMount={handleEditorDidMount}
					/>
				</Stack>
			</Stack>
			<Stack style={{ alignItems: 'flex-end', justifyContent: 'flex-end', padding: '1rem', height: '100%' }}>
				<Box>
					<Button>Validate Query</Button>
				</Box>
			</Stack>
		</Stack>
	);
};

const defaultTileOpts = {
	name: '',
	description: '',
	stream: '',
};

const CreateTileForm = () => {
	const { form } = useTileForm(defaultTileOpts);

	return (
		<Stack style={{ height: '100%', padding: '1rem', flexDirection: 'row' }} gap={24}>
			<VizEditorModal/>
			<Stack style={{ width: '60%' }}>
				<Config form={form} />
			</Stack>
			<Stack style={{ height: '100%', width: '40%' }} gap={24}>
				<VisPreview />
				<DataPreview />
			</Stack>
		</Stack>
	);
};

export default CreateTileForm;
