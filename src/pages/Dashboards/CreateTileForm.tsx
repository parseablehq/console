import { Box, Button, Divider, ScrollArea, Select, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/Form.module.css';
import { useForm } from '@mantine/form';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { getLogStreamSchema } from '@/api/logStream';
import { Field } from '@/@types/parseable/dataType';
import { Editor } from '@monaco-editor/react';
import VizEditorModal, { Viz } from './VizEditorModal';
import { SchemaList } from '../Stream/components/Querier/QueryCodeEditor';
import { IconAlertTriangle, IconArrowLeft, IconChartPie } from '@tabler/icons-react';
import { useDashboardsQuery, useTileQuery } from '@/hooks/useDashboards';
import {
	Dashboard,
	EditTileType,
	FormOpts,
	Tile,
	TileFormType,
	TileQueryResponse,
} from '@/@types/parseable/api/dashboards';
import { CodeHighlight } from '@mantine/code-highlight';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import { useLogsStore } from '../Stream/providers/LogsProvider';
import dayjs from 'dayjs';
import TimeRange from '@/components/Header/TimeRange';
import { isCircularChart, isGraph } from './Charts';
import { usePostLLM } from '@/hooks/usePostLLM';
import { notify } from '@/utils/notification';

const selectDashboardWarningText = 'Select a dashboard to continue';
const validateQueryWarningText = 'Validate query to continue';
const emptyVizWarning = 'No visualization selected for the tile';
const noDataWarning = 'No data available for the query';
const invalidVizConfig = 'Invalid visualization config';

const { toggleVizEditorModal, toggleCreateTileModal } = dashboardsStoreReducers;

const getErrorMsg = (form: TileFormType, configType: 'basic' | 'data' | 'viz'): string | null => {
	const { dashboardId, isQueryValidated, data, visualization } = form.values;
	const hasVizConfigErrors = _.some(_.keys(form.errors), (key) => _.startsWith(key, 'visualization.'));
	const hasNoData = _.isEmpty(data) || _.isEmpty(data.records);
	if (_.isEmpty(dashboardId)) {
		return selectDashboardWarningText;
	} else if (configType === 'data' || configType === 'viz') {
		if (!isQueryValidated) {
			return validateQueryWarningText;
		}
		if (configType === 'viz') {
			if (hasNoData) {
				return noDataWarning;
			} else if (hasVizConfigErrors || _.isEmpty(visualization)) {
				return invalidVizConfig;
			} else if (_.isEmpty(visualization.visualization_type)) {
				return emptyVizWarning;
			}
		}
	} else {
		return null;
	}

	return null;
};

const SectionHeader = (props: { title: string; actionBtnProps?: { label: string; onClick: () => void } }) => {
	const { title, actionBtnProps } = props;
	return (
		<Stack className={classes.sectionHeader}>
			<Text style={{ fontSize: '0.725rem', fontWeight: 500 }}>{title}</Text>
			{actionBtnProps && (
				<Button onClick={actionBtnProps.onClick} variant="outline">
					{actionBtnProps.label}
				</Button>
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

	if (!_.includes([emptyVizWarning, invalidVizConfig], props.msg)) return <WarningView msg={props.msg} />;

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

	const [, setDashbaordsStore] = useDashboardsStore((_store) => null);

	const openVizModal = useCallback(() => setDashbaordsStore((store) => toggleVizEditorModal(store, true)), []);
	const sectionHeaderProps = {
		title: 'Visualization Preview',
		...(errorMsg ? {} : { actionBtnProps: { label: 'Edit', onClick: openVizModal } }),
	};

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
			values: { data },
		},
	} = props;
	const containerRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
	const [containerSize, setContainerSize] = useState({ height: 0, width: 0 });
	const errorMsg = getErrorMsg(props.form, 'data');
	useEffect(() => {
		if (containerRef.current) {
			setContainerSize({
				height: containerRef.current?.offsetHeight || 0,
				width: containerRef.current?.offsetWidth || 0,
			});
		}
	}, [errorMsg]);

	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<SectionHeader title="Data Preview" />
			{errorMsg ? (
				<WarningView msg={errorMsg} />
			) : (
				<ScrollArea style={{ flex: 1 }}>
					<Stack ref={containerRef} style={{ flex: 1 }}>
						<Stack style={{ width: containerSize.width, height: containerSize.height }}>
							<CodeHighlight
								code={JSON.stringify(data?.records || [], null, 2)}
								style={{ background: 'white' }}
								language="json"
								styles={{ copy: { marginLeft: '550px' } }}
								copyLabel="Copy Records"
							/>
						</Stack>
					</Stack>
				</ScrollArea>
			)}
		</Stack>
	);
};

const useTileForm = (opts: {
	activeDashboard: Dashboard | null;
	editTileId: string | null;
	tileData: TileQueryResponse;
}) => {
	const { activeDashboard, editTileId, tileData } = opts;
	const formOpts = genTileFormOpts({ activeDashboard, editTileId, tileData });
	const form = useForm<FormOpts>({
		mode: 'controlled',
		initialValues: formOpts,
		validate: {
			name: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			description: (_val) => null,
			query: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			isQueryValidated: (val) => (val === true ? null : 'Query not validated'),
			dashboardId: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
			visualization: {
				visualization_type: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
				size: (val) => (_.isEmpty(val) ? 'Cannot be empty' : null),
				circular_chart_config: {
					name_key: (_value, values, _path) => {
						const {
							visualization: { visualization_type, circular_chart_config },
						} = values;
						if (isCircularChart(visualization_type)) {
							const name_key = _.get(circular_chart_config, 'name_key', null);
							return _.isEmpty(name_key) ? 'Cannot be empty' : null;
						}
					},
					value_key: (_value, values, _path) => {
						const {
							visualization: { visualization_type, circular_chart_config },
						} = values;
						if (isCircularChart(visualization_type)) {
							const value_key = _.get(circular_chart_config, 'value_key', null);
							return _.isEmpty(value_key) ? 'Cannot be empty' : null;
						}
					},
				},
				graph_config: {
					x_key: (_value, values, _path) => {
						const {
							visualization: { visualization_type, graph_config },
						} = values;
						if (isGraph(visualization_type)) {
							const x_key = _.get(graph_config, 'x_key', null);
							return _.isEmpty(x_key) ? 'Cannot be empty' : null;
						}
					},
					y_keys: (_value, values, _path) => {
						const {
							visualization: { visualization_type, graph_config },
						} = values;
						if (isGraph(visualization_type)) {
							const y_keys = _.get(graph_config, 'y_keys', null);
							return _.isEmpty(y_keys) ? 'Cannot be empty' : null;
						}
					},
				},
			},
		},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const colors = form.values.visualization?.color_config;

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
			values: { query, isQueryValidated, dashboardId },
		},
		onChangeValue,
	} = props;
	const [llmActive] = useAppStore((store) => store.instanceConfig?.llmActive);
	const containerRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
	const [localStream, setLocalStream] = useState<string>('');
	const [fields, setFields] = useState<Field[]>([]);
	const [initialHeight, setInitialHeight] = useState(0);
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	const [timeRange] = useLogsStore((store) => store.timeRange);
	const [aiQuery, setAiQuery] = useState('');
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const allStreams = useMemo(
		() => _.map(userSpecificStreams, (stream) => ({ label: stream.name, value: stream.name })),
		[userSpecificStreams],
	);
	const { data: resAIQuery, postLLMQuery } = usePostLLM();

	const onEditorChange = useCallback((query: string | undefined) => {
		onChangeValue('query', query || '');
		onChangeValue('isQueryValidated', false);
	}, []);

	useEffect(() => {
		if (resAIQuery) {
			const warningMsg =
				'-- LLM generated query is experimental and may produce incorrect answers\n-- Always verify the generated SQL before executing\n\n';
			onEditorChange(warningMsg + resAIQuery);
		}
	}, [resAIQuery]);

	useEffect(() => {
		if (containerRef.current) {
			setInitialHeight(containerRef.current.offsetHeight);
		}
		setFields([]);
		if (_.size(localStream) > 0) {
			fetchStreamFields(localStream, (fields: Field[]) => setFields(fields));
		}
	}, [localStream]);

	const onFetchTileSuccess = useCallback((data: TileQueryResponse) => {
		props.form.setFieldValue('isQueryValidated', true);
		props.form.setFieldValue('data', data);
		props.form.validate();
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
	}, [query, dashboardId, dashboards, timeRange]);

	const onStreamSelect = useCallback((val: string | null) => {
		setLocalStream(val || '');
	}, []);

	const isValidStream = !_.isEmpty(localStream);
	const handleAIGenerate = useCallback(() => {
		if (!aiQuery?.length) {
			notify({ message: 'Please enter a valid query' });
			return;
		}
		localStream && postLLMQuery(aiQuery, localStream);
	}, [aiQuery, localStream]);
	const errorMsg = getErrorMsg(props.form, 'basic');

	return (
		<Stack style={{ padding: '0 1rem', flex: 1 }} gap={4}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text className={classes.fieldTitle}>Query</Text>
				<Stack style={{ flexDirection: 'row', ...(errorMsg ? { display: 'none' } : {}) }}>
					<TimeRange />
					<Select
						data={allStreams}
						onChange={onStreamSelect}
						classNames={{ label: classes.fieldTitle }}
						key="stream"
						placeholder="Select Stream"
					/>
				</Stack>
			</Stack>
			{errorMsg && <Text className={classes.warningText}>{errorMsg}</Text>}
			<Stack
				className={classes.queryCodeContainer}
				style={{ marginTop: '1rem', flex: 1, ...(errorMsg ? { display: 'none' } : {}) }}>
				<Box style={{ marginBottom: 8 }}>
					{llmActive ? (
						<Stack gap={0} style={{ flexDirection: 'row', width: '100%' }}>
							<TextInput
								type="text"
								name="ai_query"
								id="ai_query"
								value={aiQuery}
								onChange={(e) => setAiQuery(e.target.value)}
								placeholder={
									isValidStream
										? 'Enter plain text to generate SQL query using OpenAI'
										: 'Choose a schema to generate AI query'
								}
								style={{ flex: 1 }}
								disabled={!isValidStream}
							/>
							<Button
								variant="filled"
								color="brandPrimary.4"
								radius={0}
								onClick={handleAIGenerate}
								disabled={!isValidStream}>
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
						<Stack style={{ maxHeight: `${initialHeight * 0.5}px` }}>
							<SchemaList currentStream={localStream} fields={fields} />
						</Stack>
					<Stack style={{ maxHeight: `${initialHeight * 0.4}px`, flex: 1 }}>
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
						/>
					</Stack>
				</Stack>
			</Stack>
			<Stack
				style={{
					alignItems: 'flex-end',
					justifyContent: 'flex-end',
					padding: '1rem 0',
					...(errorMsg ? { display: 'none' } : {}),
				}}>
				<Box>
					<Button
						variant="outline"
						disabled={_.isEmpty(query) || isLoading}
						loading={isLoading}
						onClick={validateQuery}
						w="10rem">
						{!isQueryValidated ? 'Validate Query' : 'Refetch Data'}
					</Button>
				</Box>
			</Stack>
		</Stack>
	);
};

const Config = (props: { form: TileFormType; onChangeValue: (key: string, value: any) => void }) => {
	const { form, onChangeValue } = props;
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
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
					style={{ width: '50%' }}
				/>
				<Select
					data={allDashboards}
					classNames={{ label: classes.fieldTitle }}
					label="Dashboard"
					key="dashboardId"
					{...form.getInputProps('dashboardId')}
					style={{ width: '50%' }}
					disabled
				/>
			</Stack>
			<Stack style={{ padding: '0 1rem' }}>
				<TextInput
					classNames={{ label: classes.fieldTitle }}
					label="Description (Optional)"
					key="description"
					{...form.getInputProps('description')}
				/>
			</Stack>
			<Divider my="0.6rem" />
			<Query form={form} onChangeValue={onChangeValue} />
		</Stack>
	);
};

const sanitizeFormValues = (form: TileFormType, type: 'create' | 'update'): EditTileType => {
	const { name, description, query, visualization, tile_id, order } = form.values;
	const { visualization_type, size, circular_chart_config, graph_config, color_config, tick_config } = visualization;
	const vizElementConfig = isCircularChart(visualization_type)
		? { circular_chart_config }
		: isGraph(visualization_type)
		? { graph_config }
		: {};
	return {
		name,
		description,
		query,
		visualization: {
			visualization_type,
			size,
			...vizElementConfig,
			color_config,
			tick_config,
		},
		order,
		...(type === 'update' && _.isString(tile_id) ? { tile_id } : {}),
	};
};

const defaultVizOpts = {
	visualization_type: 'donut-chart' as 'donut-chart',
	size: 'sm',
	color_config: [],
	tick_config: [],
	circular_chart_config: {},
	graph_config: { x_key: '', y_keys: [] },
};

const defaultFormOpts = {
	name: '',
	description: '',
	isQueryValidated: false,
	isVizValidated: false,
	query: '',
	data: { records: [], fields: [] },
	dashboardId: null,
	visualization: defaultVizOpts,
};

const genTileFormOpts = (opts: {
	activeDashboard: Dashboard | null;
	editTileId: string | null;
	tileData: TileQueryResponse;
}) => {
	const { activeDashboard, editTileId } = opts;
	if (!editTileId)
		return {
			...defaultFormOpts,
			dashboardId: activeDashboard?.dashboard_id || null,
			order: _.size(activeDashboard?.tiles) + 1,
		};

	const currentTile = _.find(activeDashboard?.tiles, (tile) => tile.tile_id === editTileId);
	if (!currentTile)
		return {
			...defaultFormOpts,
			dashboardId: activeDashboard?.dashboard_id || null,
			order: _.size(activeDashboard?.tiles) + 1,
		};
	const {
		visualization: { circular_chart_config, graph_config },
	} = currentTile;

	return {
		...currentTile,
		isQueryValidated: true,
		isVizValidated: true,
		data: opts.tileData,
		visualization: {
			...defaultVizOpts,
			...currentTile.visualization,
			circular_chart_config: _.isEmpty(circular_chart_config) ? {} : circular_chart_config,
			graph_config: _.isEmpty(graph_config) ? {} : graph_config,
		},
		dashboardId: activeDashboard ? activeDashboard.dashboard_id : null,
	};
};

const CreateTileForm = () => {
	const [dashboards, setDashbaordsStore] = useDashboardsStore((store) => store.dashboards);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const [editTileId] = useDashboardsStore((store) => store.editTileId);
	const [tilesData] = useDashboardsStore((store) => store.tilesData);
	const tileData = _.get(tilesData, editTileId || '', { records: [], fields: [] });
	const { form, onChangeValue } = useTileForm({ activeDashboard, editTileId, tileData });

	const closeForm = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateTileModal(store, false));
	}, []);

	const { updateDashboard, isUpdatingDashboard } = useDashboardsQuery({});

	const onCreate = useCallback(() => {
		const { dashboardId } = form.values;
		const dashboard = _.find(dashboards, (dashboard) => dashboard.dashboard_id === dashboardId);

		if (!dashboard) return;

		const existingTiles = dashboard.tiles;
		if (editTileId) {
			const updatedTile = sanitizeFormValues(form, 'update');
			const tileIndex = _.findIndex(existingTiles, (tile) => tile.tile_id === editTileId);
			existingTiles[tileIndex] = updatedTile as Tile;
			updateDashboard({ dashboard: { ...dashboard, tiles: [...existingTiles] }, onSuccess: closeForm });
		} else {
			const newTile = sanitizeFormValues(form, 'create');
			updateDashboard({ dashboard: { ...dashboard, tiles: [...existingTiles, newTile] }, onSuccess: closeForm });
		}
	}, [form, dashboards, editTileId]);

	return (
		<Stack style={{ height: '100%', width: '100%' }} gap={0}>
			<Stack style={{ justifyContent: 'space-between', padding: '1rem', flexDirection: 'row' }}>
				<Stack gap={10} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
					<IconArrowLeft onClick={closeForm} stroke={1.2} size={'1.4rem'} className={classes.arrowLeftIcon} />
					<Text style={{ fontSize: '0.8rem', fontWeight: 600 }}>{editTileId ? 'Edit Tile' : 'Create Tile'}</Text>
				</Stack>
				<Stack style={{ flexDirection: 'row' }} gap={20}>
					<Box>
						<Button onClick={closeForm} disabled={isUpdatingDashboard} variant="outline">
							Cancel
						</Button>
					</Box>
					<Box>
						<Button
							disabled={!form.isValid() || !form.isDirty()}
							onClick={onCreate}
							loading={isUpdatingDashboard}
							variant="filled">
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
