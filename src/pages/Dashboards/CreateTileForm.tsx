import { Box, Button, Select, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/Form.module.css';
import { useForm, UseFormReturnType } from '@mantine/form';
import { Tile, useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { getLogStreamSchema } from '@/api/logStream';
import { Field } from '@/@types/parseable/dataType';
import { Editor } from '@monaco-editor/react';
import VizEditorModal from './VizEditorModal';
import { SchemaList } from '../Stream/components/Querier/QueryCodeEditor';
import { IconAlertTriangle, IconAlertTriangleFilled, IconChartPie } from '@tabler/icons-react';
import { useTileQuery } from '@/hooks/useDashboards';
import { FormOpts, TileFormType, TileQueryResponse } from '@/@types/parseable/api/dashboards';
import { CodeHighlight } from '@mantine/code-highlight';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';

const selectStreamWarningText = 'Select a stream to continue';
const validateQueryWarningText = 'Validate query to continue';
const emptyVizWarning = 'Select visualization for the data';

const {toggleVizEditorModal} = dashboardsStoreReducers;

const SectionHeader = (props: { title: string; actionBtnProps?: { label: string; onClick: () => void } }) => {
	const { title, actionBtnProps } = props;
	return (
		<Stack className={classes.sectionHeader}>
			<Text style={{ fontSize: '0.725rem', fontWeight: 500 }}>{title}</Text>
			{actionBtnProps && (
				<Box>
					<Button onClick={actionBtnProps.onClick} variant="outline">
						{actionBtnProps.label}
					</Button>
				</Box>
			)}
		</Stack>
	);
};

const WarningView = (props: { msg: string | null }) => {
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>
			<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>{props.msg}</Text>
		</Stack>
	);
};

const EmptyVizView = (props: { msg: string | null }) => {
	const [, setDashboardStore] = useDashboardsStore((_store) => null);
	const openVizModal = useCallback(() => {
		setDashboardStore((store) => toggleVizEditorModal(store, true));
	}, []);
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
			<IconChartPie stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>{props.msg}</Text>
			<Button variant="outline" onClick={openVizModal}>
				Select Visualization
			</Button>
		</Stack>
	);
};

const VisPreview = (props: { form: TileFormType }) => {
	const {
		form: {
			values: { isQueryValidated, stream, data },
		},
	} = props;
	const isValidStream = !_.isEmpty(stream);
	const showWarning = (!isValidStream || !isQueryValidated) && _.isEmpty(data);
	const hasNoViz = true;
	const errorMsg = showWarning ? (!isValidStream ? selectStreamWarningText : validateQueryWarningText) : null;
	
	return (
		<Stack className={classes.sectionContainer} {...(showWarning ? { gap: 0 } : {})}>
			<VizEditorModal form={props.form}/>
			<SectionHeader title="Visualization Preview" />
			{showWarning ? <WarningView msg={errorMsg} /> : hasNoViz ? <EmptyVizView msg={emptyVizWarning}/> : null}
		</Stack>
	);
};

const DataPreview = (props: { form: TileFormType }) => {
	const {
		form: {
			values: { isQueryValidated, stream, data },
		},
	} = props;
	const isValidStream = !_.isEmpty(stream);
	const containerRef = useRef(null);
	const [containerSize, setContainerSize] = useState({ height: 0, width: 0 });
	useEffect(() => {
		if (containerRef.current) {
			setContainerSize({
				height: containerRef.current?.offsetHeight || 0,
				width: containerRef.current?.offsetWidth || 0,
			});
		}
	}, []);
	// const showWarning = false;
	const showWarning = (!isValidStream || !isQueryValidated) && _.isEmpty(data);
	const errorMsg = showWarning ? (!isValidStream ? selectStreamWarningText : validateQueryWarningText) : null;
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<SectionHeader title="Data Preview" />
			<Stack ref={containerRef} style={{ flex: 1, overflow: 'scroll' }}>
				<Stack style={{ width: containerSize.width, height: containerSize.height }}>
					{showWarning ? (
						<WarningView msg={errorMsg} />
					) : (
						<CodeHighlight
							code={JSON.stringify(data?.records || [], null, 2)}
							style={{ background: 'white' }}
							language="json"
							styles={{ copy: { marginLeft: '550px' } }}
							copyLabel="Copy Records"
						/>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

const useTileForm = (opts: FormOpts) => {
	const form = useForm<FormOpts>({
		mode: 'controlled',
		initialValues: opts,
		validate: {},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const colors = form.values.visualization?.colors

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
	}, []);

	const updateColors = useCallback(
		(key: string, value: string) => {
			form.setFieldValue('colors', {
				...(colors ? {...colors} : {}),
				[key]: value,
			});
		},
		[colors],
	);

	return { form, onChangeValue, updateColors };
};

const fetchStreamFields = async (stream: string, setFields: (fields: Field[]) => void) => {
	try {
		const res = await getLogStreamSchema(stream);
		setFields(res.data.fields);
	} catch {
		setFields([]);
	}
};

const Query = (props: { form: TileFormType; onChangeValue: (key: string, value: any) => void }) => {
	const {
		form: {
			values: { stream, query, isQueryValidated },
		},
		onChangeValue,
	} = props;
	const containerRef = useRef(null);
	const [fields, setFields] = useState<Field[]>([]);
	const [initialHeight, setInitialHeight] = useState(0);
	const isValidStream = !_.isEmpty(stream);
	useEffect(() => {
		setFields([]);
		if (_.size(stream) > 0) {
			fetchStreamFields(stream, (fields: Field[]) => setFields(fields));
		}
	}, [stream]);

	useEffect(() => {
		if (containerRef.current) {
			setInitialHeight(containerRef.current.offsetHeight);
		}
	}, [isValidStream]);

	const onFetchTileSuccess = useCallback((data: TileQueryResponse) => {
		onChangeValue('isQueryValidated', true);
		onChangeValue('data', data);
	}, []);

	const { fetchTileData, isLoading, isError, isSuccess } = useTileQuery({ onSuccess: onFetchTileSuccess });

	const validateQuery = useCallback(() => {
		const now = new Date();
		const santizedQuery = sanitiseSqlString(query);
		onChangeValue('query', santizedQuery);
		fetchTileData({ query: santizedQuery, startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), endTime: now });
	}, [query]);

	const onEditorChange = useCallback((query: string | undefined) => {
		onChangeValue('query', query || '');
		onChangeValue('isQueryValidated', false);
		// onChangeValue('data', null)
	}, []);

	return (
		<Stack style={{ padding: '0 1rem', flex: 1 }} gap={4}>
			<Text className={classes.fieldTitle}>Query</Text>
			{!isValidStream && <Text className={classes.warningText}>{selectStreamWarningText}</Text>}
			<Stack className={classes.queryCodeContainer} style={{ flex: 1, ...(isValidStream ? {} : { display: 'none' }) }}>
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
				<Stack ref={containerRef} style={{ flex: 1 }}>
					<Stack style={{ maxHeight: `${initialHeight * 0.4}px`, overflowY: 'auto' }}>
						<SchemaList currentStream={stream} fields={fields} />
					</Stack>
					<Stack style={{ maxHeight: `${initialHeight * 0.5}px`, flex: 1 }}>
						<Editor
							defaultLanguage="sql"
							value={query}
							onChange={onEditorChange}
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
			</Stack>
			<Stack
				style={{
					alignItems: 'flex-end',
					justifyContent: 'flex-end',
					padding: '1rem 0',
					...(isValidStream ? {} : { display: 'none' }),
				}}>
				<Box>
					<Button
						variant="outline"
						disabled={_.isEmpty(query) || isQueryValidated || isLoading}
						onClick={validateQuery}>
						Validate Query
					</Button>
				</Box>
			</Stack>
		</Stack>
	);
};

const Config = (props: { form: TileFormType; onChangeValue: (key: string, value: any) => void }) => {
	const { form, onChangeValue } = props;
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const allStreams = useMemo(
		() => _.map(userSpecificStreams, (stream) => ({ label: stream.name, value: stream.name })),
		[userSpecificStreams],
	);
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
			<Query form={form} onChangeValue={onChangeValue} />
		</Stack>
	);
};

const defaultTileOpts = {
	name: '',
	description: '',
	stream: 'teststream',
	isQueryValidated: false,
	query: 'SELECT level, COUNT(*) AS level_count FROM teststream GROUP BY level;',
	data: null,
	visualization: {
		type: 'donut-chart',
		size: 'sm',
		colors: {},
		circularChartConfig: {},
		graphConfig: {},
		tableConfig: {},
	},
};

const CreateTileForm = () => {
	const { form, onChangeValue } = useTileForm(defaultTileOpts);

	return (
		<Stack style={{ height: '100%', padding: '1rem', flexDirection: 'row' }} gap={24}>
			<Stack style={{ width: '60%' }}>
				<Config form={form} onChangeValue={onChangeValue} />
			</Stack>
			<Stack style={{ height: '100%', width: '40%' }} gap={24}>
				<VisPreview form={form} />
				<DataPreview form={form} />
			</Stack>
		</Stack>
	);
};

export default CreateTileForm;
