import { Box, Button, Select, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/Form.module.css';
import { useForm } from '@mantine/form';
import {  useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { getLogStreamSchema } from '@/api/logStream';
import { Field } from '@/@types/parseable/dataType';
import { Editor } from '@monaco-editor/react';
import VizEditorModal, { Viz } from './VizEditorModal';
import { SchemaList } from '../Stream/components/Querier/QueryCodeEditor';
import { IconAlertTriangle, IconArrowLeft, IconChartPie } from '@tabler/icons-react';
import { useTileQuery } from '@/hooks/useDashboards';
import { FormOpts, TileFormType, TileQueryResponse } from '@/@types/parseable/api/dashboards';
import { CodeHighlight } from '@mantine/code-highlight';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import { useLogsStore } from '../Stream/providers/LogsProvider';
import dayjs from 'dayjs';
import TimeRange from '@/components/Header/TimeRange';
import { isCircularChart, isGraph } from './Charts';

const selectDashboardWarningText = 'Select a dashboard to continue'
const selectStreamWarningText = 'Select a stream to continue';
const validateQueryWarningText = 'Validate query to continue';
const emptyVizWarning = 'No visualization selected for the tile';
const noDataWarning = 'No data available for the query';
const invalidVizConfig = 'Invalid visualization config';

const { toggleVizEditorModal, toggleCreateTileModal } = dashboardsStoreReducers;

const getErrorMsg = (form: TileFormType, configType: 'basic' | 'data' | 'viz'): string | null => {
	const { stream, dashboardId, isQueryValidated,  data, visualization} = form.values;
	const hasVizConfigErrors = _.some(_.keys(form.errors), key => _.startsWith(key, 'visualization.'));
	// form.validateField('visualization')

	const hasNoData = _.isEmpty(data) || _.isEmpty(data.records);
	if (_.isEmpty(dashboardId)) {
		return selectDashboardWarningText;
	} else if (_.isEmpty(stream)) {
		return selectStreamWarningText;
	} else if (configType === 'data' || configType === 'viz') {
		if (!isQueryValidated) {
			return validateQueryWarningText;
		}
		if (configType === 'viz') {
			if (hasNoData) {
				return noDataWarning;
			} else if (hasVizConfigErrors || _.isEmpty(visualization)) {
				return invalidVizConfig;
			} else if (_.isEmpty(visualization.type)) {
				return emptyVizWarning;
			}
		}
	} else {
		return null;
	}

	return null;
}

const SectionHeader = (props: { title: string; actionBtnProps?: { label: string; onClick: () => void } }) => {
	const { title, actionBtnProps } = props;
	return (
		<Stack className={classes.sectionHeader}>
			<Text style={{ fontSize: '0.725rem', fontWeight: 500 }}>{title}</Text>
			{actionBtnProps && (
				// <Box>
					<Button onClick={actionBtnProps.onClick} variant="outline">
						{actionBtnProps.label}
					</Button>
				// </Box>
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

	if (!_.includes([emptyVizWarning, invalidVizConfig], props.msg)) return <WarningView msg={props.msg}/>

	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
			<IconChartPie stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>{props.msg}</Text>
			{_.includes([emptyVizWarning, invalidVizConfig], props.msg) && (
				<Button variant="outline" onClick={openVizModal}>
					{props.msg === emptyVizWarning ? 'Select Visualization' : 'Edit Visualization'}
				</Button>
			)}
		</Stack>
	);
};

const VisPreview = (props: { form: TileFormType }) => {
	const {
		form: {
			values: { visualization },
		},
	} = props;
	const errorMsg = getErrorMsg(props.form, 'viz');

	useEffect(() => {
		props.form.validateField('visualization');
	}, [visualization]);

	const [, setDashbaordsStore] = useDashboardsStore((store) => null);

	const openVizModal = useCallback(() => setDashbaordsStore((store) => toggleVizEditorModal(store, true)), []);
	const sectionHeaderProps = {
		title: 'Visualization Preview',
		...(errorMsg ? {} : { actionBtnProps: { label: 'Edit', onClick: openVizModal } }),
	};

	console.log(sectionHeaderProps);

	return (
		<Stack className={classes.sectionContainer} {...(errorMsg ? { gap: 0 } : { gap: 0 })}>
			<VizEditorModal form={props.form} />
			<SectionHeader {...sectionHeaderProps} />
			{errorMsg ? (
				<EmptyVizView msg={errorMsg} />
			) : (
				<Stack style={{ flex: 1, width: '100%' }}>
					<Viz form={props.form} />
				</Stack>
			)}
		</Stack>
	);
};

const DataPreview = (props: { form: TileFormType }) => {
	const {
		form: {
			values: {  data },
		},
	} = props;
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
	const errorMsg = getErrorMsg(props.form, 'data');

	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<SectionHeader title="Data Preview" />
			<Stack ref={containerRef} style={{ flex: 1, overflow: 'scroll' }}>
				<Stack style={{ width: containerSize.width, height: containerSize.height }}>
					{errorMsg ? (
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
		validate: {
			name: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			stream: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			description: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			query: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			isQueryValidated: (val) => (val === true ? null : 'Query not validated'),
			dashboardId: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			visualization: {
				type: (val) => _.isEmpty(val) ? 'Cannot be empty' : null,
				size: (val) => _.isEmpty(val) ? 'Cannot be empty' : null,
				circularChartConfig: {
					nameKey: (value, values, path) => {
						const {visualization: {type, circularChartConfig}} = values;
						if (isCircularChart(type)) {
							const nameKey = _.get(circularChartConfig, 'nameKey', null);
							return _.isEmpty(nameKey) ? 'Cannot be empty' : null
						}
					},
					valueKey: (value, values, path) => {
						const {visualization: {type, circularChartConfig}} = values;
						if (isCircularChart(type)) {
							const valueKey = _.get(circularChartConfig, 'valueKey', null);
							return _.isEmpty(valueKey) ? 'Cannot be empty' : null
						}
					},
				},
				graphConfig: {
					xAxis: (value, values, path) => {
						const {visualization: {type, graphConfig}} = values;
						if (isGraph(type)) {
							const xAxis = _.get(graphConfig, 'xAxis', null);
							return _.isEmpty(xAxis) ? 'Cannot be empty' : null
						}
					},
					yAxis: (value, values, path) => {
						const {visualization: {type, graphConfig}} = values;
						if (isGraph(type)) {
							const yAxis = _.get(graphConfig, 'yAxis', null);
							return _.isEmpty(yAxis) ? 'Cannot be empty' : null
						}
					},
				}
			}
		},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const colors = form.values.visualization?.colors;

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
	}, []);

	const updateColors = useCallback(
		(key: string, value: string) => {
			form.setFieldValue('colors', {
				...(colors ? { ...colors } : {}),
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
			values: { stream, query, isQueryValidated, dashboardId },
		},
		onChangeValue,
	} = props;
	const [llmActive] = useAppStore((store) => store.instanceConfig?.llmActive);
	const containerRef = useRef(null);
	const [fields, setFields] = useState<Field[]>([]);
	const [initialHeight, setInitialHeight] = useState(0);
	const isValidStream = !_.isEmpty(stream);
	const [dashboards] = useDashboardsStore(store => store.dashboards);
	const [timeRange] = useLogsStore(store => store.timeRange)

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
		props.form.setFieldValue('isQueryValidated', true)
		props.form.setFieldValue('data', data)
		props.form.validate()
	}, []);

	const { fetchTileData, isLoading } = useTileQuery({ onSuccess: onFetchTileSuccess });

	const validateQuery = useCallback(() => {
		if (_.isEmpty(dashboardId)) return;

		const selectedDashboard = _.find(dashboards, (dashboard) => dashboard.dashboard_id === dashboardId);
		if (_.isEmpty(selectedDashboard)) return;

		const santizedQuery = sanitiseSqlString(query, true, 100);
		onChangeValue('query', santizedQuery);
		const { from, to } = selectedDashboard.time_filter || { from: timeRange.startTime, to: timeRange.endTime };
		fetchTileData({ query: santizedQuery, startTime: dayjs(from).toDate(), endTime: dayjs(to).toDate() });
	}, [query, dashboardId, dashboards]);

	const onEditorChange = useCallback((query: string | undefined) => {
		onChangeValue('query', query || '');
		onChangeValue('isQueryValidated', false);
		// onChangeValue('data', null)
	}, []);

	const errorMsg = getErrorMsg(props.form, 'basic')

	return (
		<Stack style={{ padding: '0 1rem', flex: 1 }} gap={4}>
			<Text className={classes.fieldTitle}>Query</Text>
			{errorMsg && <Text className={classes.warningText}>{errorMsg}</Text>}
			<Stack className={classes.queryCodeContainer} style={{ flex: 1, ...(isValidStream ? {} : { display: 'none' }) }}>
				<Box style={{ marginBottom: 8 }}>
					{llmActive ? (
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
						loading={isLoading}
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
	const [dashboards] = useDashboardsStore(store => store.dashboards)
	const allStreams = useMemo(
		() => _.map(userSpecificStreams, (stream) => ({ label: stream.name, value: stream.name })),
		[userSpecificStreams],
	);
	const allDashboards = useMemo(
		() => _.map(dashboards, (dashboard) => ({ label: dashboard.name, value: dashboard.dashboard_id })),
		[dashboards],
	);
	return (
		<Stack className={classes.sectionContainer} style={{ height: '100%' }}>
			<SectionHeader title="Tile Config" />
			<Stack style={{ flexDirection: 'row', padding: '0 1rem' }}>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					label="Name"
					key="name"
					{...form.getInputProps('name')}
					style={{ width: '33%' }}
				/>
				<Select
					data={allDashboards}
					classNames={{ label: classes.fieldTitle }}
					label="Dashboard"
					key="dashboardId"
					{...form.getInputProps('dashboardId')}
					style={{ width: '33%' }}
				/>
				<Select
					data={allStreams}
					classNames={{ label: classes.fieldTitle }}
					label="Stream"
					key="stream"
					{...form.getInputProps('stream')}
					style={{ width: '33%' }}
				/>
			</Stack>
			<Stack style={{ padding: '0 1rem' }}>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					label="Description"
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
	stream: '',
	isQueryValidated: false,
	isVizValidated: false,
	query: '',
	data: null,
	dashboardId: null,
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
	const [, setDashbaordsStore] = useDashboardsStore((store) => null);

	const closeEditForm = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateTileModal(store, false));
	}, []);

	return (
		<Stack style={{ height: '100%', width: '100%' }} gap={0}>
			<Stack style={{ justifyContent: 'space-between', padding: '1rem', flexDirection: 'row' }}>
				<Stack gap={10} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
					<IconArrowLeft onClick={closeEditForm} stroke={1.2} size={'1.4rem'} className={classes.arrowLeftIcon} />
					<Text style={{ fontSize: '0.8rem', fontWeight: 600 }}>Create Tile</Text>
				</Stack>
				<Stack style={{ flexDirection: 'row' }} gap={20}>
					<TimeRange/>
					<Box>
						<Button disabled={!form.isValid()} variant="filled">
							Save Changes
						</Button>
					</Box>
				</Stack>
			</Stack>
			<Stack style={{ height: '100%', padding: '1rem', paddingTop: 0, flexDirection: 'row' }} gap={24}>
				<Stack style={{ width: '60%' }}>
					<Config form={form} onChangeValue={onChangeValue} />
				</Stack>
				<Stack style={{ height: '100%', width: '40%' }} gap={24}>
					<VisPreview form={form} />
					<DataPreview form={form} />
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CreateTileForm;
