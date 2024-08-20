import { ActionIcon, Box, Button, CloseIcon, Modal, Select, Stack, Text } from '@mantine/core';
import classes from './styles/VizEditor.module.css';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useEffect } from 'react';
import _ from 'lodash';
import { isCircularChart, renderCircularChart, renderGraph } from './Charts';
import { tickUnits, TileFormType, tileSizes, visualizations } from '@/@types/parseable/api/dashboards';
import { IconAlertTriangle, IconPlus } from '@tabler/icons-react';
import TableViz from './Table';
import { getRandomUnitTypeForChart, getUnitTypeByKey } from './utils';
const { toggleVizEditorModal } = dashboardsStoreReducers;

const inValidVizType = 'Select a visualization type';
const defaultTickUnit = 'default';

const WarningView = (props: { msg: string | null }) => {
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>
			<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>{props.msg}</Text>
		</Stack>
	);
};

const CircularChart = (props: { form: TileFormType }) => {
	const {
		visualization: { visualization_type, circular_chart_config, tick_config },
		data,
	} = props.form.values;
	const name_key = _.get(circular_chart_config, 'name_key', '');
	const value_key = _.get(circular_chart_config, 'value_key', '');
	const unit = getRandomUnitTypeForChart(tick_config);

	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderCircularChart({ queryResponse: data, name_key, value_key, chart: visualization_type, unit })}
		</Stack>
	);
};

const Graph = (props: { form: TileFormType }) => {
	const {
		visualization: { visualization_type, graph_config, tick_config },
		data,
	} = props.form.values;
	const x_key = _.get(graph_config, 'x_key', '');
	const y_keys = _.get(graph_config, 'y_keys', []);
	const yUnit = getRandomUnitTypeForChart(tick_config);
	const xUnit = getUnitTypeByKey(x_key, tick_config);

	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderGraph({ queryResponse: data, x_key, y_keys, chart: visualization_type, xUnit, yUnit })}
		</Stack>
	);
};

const Table = (props: { form: TileFormType }) => {
	const {
		visualization: { tick_config },
		data,
	} = props.form.values;

	return (
		<Stack style={{ width: '100%', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
			<Stack className={classes.tableContainer} style={{ width: '100%', height: '100%' }}>
				<TableViz data={data} tick_config={tick_config} />
			</Stack>
		</Stack>
	);
};

export const Viz = (props: { form: TileFormType }) => {
	const {
		form: {
			values: { visualization },
		},
	} = props;

	const { visualization_type } = visualization;
	const isValidVizType = _.includes(visualizations, visualization_type);
	const showWarning = !isValidVizType;
	const Viss = visualization_type === 'table' ? Table : isCircularChart(visualization_type) ? CircularChart : Graph;

	return (
		<Stack className={classes.vizContainer}>
			<Stack style={{ flex: 1 }}>
				{showWarning ? <WarningView msg={inValidVizType} /> : <Viss form={props.form} />}
			</Stack>
		</Stack>
	);
};

const vizLabelMap = {
	'donut-chart': 'Donut Chart',
	'pie-chart': 'Pie Chart',
	table: 'Table',
	'line-chart': 'Line Chart',
	'bar-chart': 'Bar Chart',
	'area-chart': 'Area Chart',
};

const sizeLabelMap = {
	sm: 'Small',
	md: 'Medium',
	lg: 'Large',
	xl: 'Full',
};

const BasicConfig = (props: { form: TileFormType }) => {
	useEffect(() => {
		props.form.validate();
	}, [props.form.values.visualization.visualization_type]);

	return (
		<Stack gap={4}>
			<Text className={classes.fieldTitle} style={{ marginBottom: '0.25rem', fontSize: '0.8rem', fontWeight: 500 }}>
				Basic Config
			</Text>
			<Stack style={{ flexDirection: 'row' }}>
				<Select
					data={_.map(visualizations, (viz) => ({ label: _.get(vizLabelMap, viz, viz), value: viz }))}
					classNames={{ label: classes.fieldTitle }}
					label="Type"
					placeholder="Type"
					key="visualization.visualization_type"
					{...props.form.getInputProps('visualization.visualization_type')}
					style={{ width: '50%' }}
				/>
				<Select
					data={_.map(tileSizes, (size) => ({ label: _.get(sizeLabelMap, size, size), value: size }))}
					classNames={{ label: classes.fieldTitle }}
					label="Size"
					placeholder="Size"
					key="visualization.size"
					{...props.form.getInputProps('visualization.size')}
					style={{ width: '50%' }}
				/>
			</Stack>
		</Stack>
	);
};

const CircularChartConfig = (props: { form: TileFormType }) => {
	const {
		form: {
			values: { data },
		},
	} = props;

	return (
		<Stack style={{ flexDirection: 'row' }}>
			<Select
				data={_.map(data?.fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				label="Name"
				placeholder="Name"
				key="visualization.circular_chart_config.name_key"
				{...props.form.getInputProps('visualization.circular_chart_config.name_key')}
				style={{ width: '50%' }}
			/>
			<Select
				data={_.map(data?.fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				label="Value"
				placeholder="Value"
				key="visualization.circular_chart_config.value_key"
				{...props.form.getInputProps('visualization.circular_chart_config.value_key')}
				style={{ width: '50%' }}
			/>
		</Stack>
	);
};

const XAxisConfig = (props: { form: TileFormType }) => {
	const {
		form: {
			values: {
				data: { fields = [] },
				visualization: { graph_config, tick_config },
			},
		},
	} = props;

	const x_key = _.get(graph_config, 'x_key', '');
	const tickConfigIndex = x_key === '' ? -1 : _.findIndex(tick_config, (e) => e.key === x_key);
	const unit = tickConfigIndex !== -1 ? tick_config[tickConfigIndex].unit : defaultTickUnit;
	const tickConfigPath = 'visualization.tick_config';

	const onChangeUnit = useCallback(
		(unit: string | null) => {
			if (unit === null || unit === defaultTickUnit) {
				if (tickConfigIndex === -1) return;

				props.form.removeListItem(tickConfigPath, tickConfigIndex);
			} else {
				if (tickConfigIndex === -1) {
					props.form.insertListItem(tickConfigPath, { unit, key: x_key });
				} else {
					const unitFieldPath = tickConfigPath + '.' + tickConfigIndex + '.unit';
					const keyFieldPath = tickConfigPath + '.' + tickConfigIndex + '.key';
					props.form.setFieldValue(unitFieldPath, unit);
					props.form.setFieldValue(keyFieldPath, x_key);
				}
			}
		},
		[tickConfigIndex, x_key, props.form],
	);

	return (
		<Stack style={{ flexDirection: 'row' }}>
			<Select
				data={_.map(fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				label="X Axis"
				placeholder="X Axis"
				key="visualization.graph_config.x_key"
				{...props.form.getInputProps('visualization.graph_config.x_key')}
				style={{ width: '50%' }}
			/>
			<Select
				data={_.map([defaultTickUnit, ...tickUnits], (unit) => ({ label: unit, value: unit }))}
				classNames={{ label: classes.fieldTitle }}
				label="Unit"
				placeholder="Unit"
				value={unit}
				style={{ width: '50%' }}
				onChange={onChangeUnit}
			/>
		</Stack>
	);
};

const AddYAxesBtn = (props: { onClick: () => void }) => {
	return (
		<Box>
			<Button
				variant="outline"
				onClick={props.onClick}
				color="gray.6"
				leftSection={<IconPlus stroke={1.2} size="1rem" />}>
				Add Axes
			</Button>
		</Box>
	);
};

const yKeysPath = 'visualization.graph_config.y_keys';

const YAxisConfig = (props: { form: TileFormType; y_key: string; index: number; totalKeys: number }) => {
	const {
		form: {
			values: {
				data: { fields = [] },
				visualization: { tick_config },
			},
		},
		y_key,
		index,
		totalKeys,
	} = props;

	const tickConfigIndex = y_key === '' ? -1 : _.findIndex(tick_config, (e) => e.key === y_key);
	const unit = tickConfigIndex !== -1 ? tick_config[tickConfigIndex].unit : defaultTickUnit;
	const tickConfigPath = 'visualization.tick_config';

	const currentKeyPath = yKeysPath + '.' + index;
	const disableRemoveBtn = totalKeys === 1;

	const onChangeUnit = useCallback(
		(unit: string | null) => {
			if (unit === null || unit === defaultTickUnit) {
				if (tickConfigIndex === -1) return;

				props.form.removeListItem(tickConfigPath, tickConfigIndex);
			} else {
				if (tickConfigIndex === -1) {
					props.form.insertListItem(tickConfigPath, { unit, key: y_key });
				} else {
					const unitFieldPath = tickConfigPath + '.' + tickConfigIndex + '.unit';
					const keyFieldPath = tickConfigPath + '.' + tickConfigIndex + '.key';
					props.form.setFieldValue(unitFieldPath, unit);
					props.form.setFieldValue(keyFieldPath, y_key);
				}
			}
		},
		[tickConfigIndex, y_key, props.form],
	);

	const onRemoveKey = useCallback(() => {
		if (disableRemoveBtn) return;

		onChangeUnit(null)
		props.form.removeListItem(yKeysPath, index);
	}, [yKeysPath, index, disableRemoveBtn, onChangeUnit]);

	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
			<Select
				data={_.map(fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				placeholder="Y Axis"
				key={currentKeyPath}
				{...props.form.getInputProps(currentKeyPath)}
				style={{ width: '50%' }}
			/>
			<Select
				data={_.map([defaultTickUnit, ...tickUnits], (unit) => ({ label: unit, value: unit }))}
				classNames={{ label: classes.fieldTitle }}
				placeholder="Unit"
				value={unit}
				style={{ width: '50%' }}
				onChange={onChangeUnit}
			/>
			<ActionIcon onClick={onRemoveKey} disabled={disableRemoveBtn} variant="light">
				<CloseIcon />
			</ActionIcon>
		</Stack>
	);
};

const GraphConfig = (props: { form: TileFormType }) => {
	const {
		form: {
			values: {
				visualization: { graph_config },
			},
		},
	} = props;

	const y_keys = _.get(graph_config, 'y_keys', []);
	const addAxes = useCallback(() => {
		props.form.insertListItem(yKeysPath, _.head(y_keys));
	}, []);
	return (
		<Stack>
			<Stack>
				<XAxisConfig form={props.form} />
				<Text>Y axis</Text>
				{_.map(y_keys, (y_key, index) => {
					return <YAxisConfig form={props.form} y_key={y_key} index={index} key={index} totalKeys={_.size(y_keys)} />;
				})}
				<AddYAxesBtn onClick={addAxes} />
			</Stack>
		</Stack>
	);
};

const ChartConfig = (props: { form: TileFormType }) => {
	if (
		props.form.values.visualization.visualization_type === 'table' ||
		_.isEmpty(props.form.values.visualization.visualization_type)
	)
		return null;

	return (
		<Stack gap={4}>
			<Text className={classes.fieldTitle} style={{ marginBottom: '0.25rem', fontSize: '0.8rem', fontWeight: 500 }}>
				Chart Config
			</Text>
			{/* debug */}
			{isCircularChart(props.form.values.visualization.visualization_type) ? (
				<CircularChartConfig form={props.form} />
			) : (
				<GraphConfig form={props.form} />
			)}
		</Stack>
	);
};

const Config = (props: { form: TileFormType }) => {
	return (
		<Stack className={classes.configContainer}>
			<Stack gap={28} style={{ overflowY: 'scroll' }}>
				<BasicConfig form={props.form} />
				<ChartConfig form={props.form} />
			</Stack>
		</Stack>
	);
};

const VizEditorModal = (props: { form: TileFormType }) => {
	const { form } = props;
	const [vizEditorModalOpen] = useDashboardsStore((store) => store.vizEditorModalOpen);
	const [, setDashboardStore] = useDashboardsStore((_store) => null);
	const closeVizModal = useCallback(() => {
		setDashboardStore((store) => toggleVizEditorModal(store, false));
	}, []);
	const isTableViz = form.values.visualization.visualization_type === 'table';
	return (
		<Modal
			opened={vizEditorModalOpen}
			onClose={closeVizModal}
			centered
			size="90rem"
			title={'Edit Visualization'}
			styles={{ body: { padding: '0 1rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			classNames={{ title: classes.modalTitle }}>
			<Stack className={classes.container}>
				<Stack style={{ width: '40%', justifyContent: 'center' }}>
					<Stack style={{ width: '100%', height: '50%' }} className={(!isTableViz && classes.chartContainer) || ''}>
						<Viz form={form} />
					</Stack>
				</Stack>
				<Stack className={classes.divider} />
				<Stack style={{ justifyContent: 'space-between', overflow: 'scroll', flex: 1, height: 'auto' }}>
					<Config form={form} />
					<Stack style={{ alignItems: 'flex-end', margin: '1rem', marginBottom: '1.5rem', marginRight: '0.5rem' }}>
						<Button onClick={closeVizModal}>Done</Button>
					</Stack>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default VizEditorModal;
