import {
	ActionIcon,
	Box,
	Button,
	CloseIcon,
	ColorInput,
	Modal,
	ScrollArea,
	Select,
	Stack,
	Text,
	DEFAULT_THEME,
} from '@mantine/core';
import classes from './styles/VizEditor.module.css';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';
import { colors, isCircularChart, isLineChart, nullColor, renderCircularChart, renderGraph } from './Charts';
import { tickUnits, TileFormType, tileSizes, visualizations } from '@/@types/parseable/api/dashboards';
import { IconAlertTriangle, IconPlus } from '@tabler/icons-react';
import TableViz from './Table';
import { getRandomUnitTypeForChart, getUnitTypeByKey } from './utils';
import { genColorConfig } from './CreateTileForm';
const { toggleVizEditorModal } = dashboardsStoreReducers;

const inValidVizType = 'Select a visualization type';
const defaultTickUnit = 'default';
const orientationTypes = [
	{ label: 'Horizontal', value: 'horizontal' },
	{ label: 'Vertical', value: 'vertical' },
];
const defaultOrientationType = 'horizontal';
const defaultGraphType = 'default';
const graphTypes = [
	{ label: 'Default', value: 'default' },
	{ label: 'Stacked', value: 'stacked' },
	{ label: 'Percent', value: 'percent' },
];
const getSwatches = (): Record<string, string> => {
	const colorsConfig = DEFAULT_THEME.colors;

	return _.reduce(
		colors,
		(acc, color) => {
			const shades = _.get(colorsConfig, color, []);
			const colorCode = shades[6] || nullColor;
			return { ...acc, [color]: colorCode };
		},
		{},
	);
};
const swatchesMap = getSwatches();
const swatches = _.values(swatchesMap);

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
	const yUnit = getUnitTypeByKey(_.head(y_keys) || '', tick_config);
	const xUnit = getUnitTypeByKey(x_key, tick_config);
	const orientation = _.get(graph_config, 'orientation', 'horizontal');
	const graphType = _.get(graph_config, 'graph_type', 'default');
	const color_config = _.get(props.form.values.visualization, 'color_config', []);

	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderGraph({
				queryResponse: data,
				x_key,
				y_keys,
				chart: visualization_type,
				xUnit,
				yUnit,
				orientation,
				graphBasicType: graphType,
				color_config,
			})}
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
	const isInvalidKey = x_key === '' || x_key === null;

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
		<Stack style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
			<Select
				data={_.map(fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				label="X Axis"
				placeholder="X Axis"
				key="visualization.graph_config.x_key"
				{...props.form.getInputProps('visualization.graph_config.x_key')}
				style={{ width: '50%' }}
				styles={{ input: isInvalidKey ? { border: '1px solid red' } : {} }}
				error={null} // the validation on useTileForm prevents submission
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
			<Stack style={{ cursor: 'not-allowed' }}>
				<ColorInput
					disabled
					disallowInput
					withPicker={false}
					withEyeDropper={false}
					swatches={swatches}
					styles={{
						input: {
							fontSize: '0rem',
							paddingInlineEnd: '0rem',
						},
					}}
					// value={colorInputValue}
					// onChange={onChangeColor}
				/>
			</Stack>
			<ActionIcon disabled={true} variant="light" style={{ marginBottom: '0.3rem' }}>
				<CloseIcon />
			</ActionIcon>
		</Stack>
	);
};

const AddYAxesBtn = (props: { onClick: () => void }) => {
	return (
		<Box>
			<Button
				variant="outline"
				onClick={props.onClick}
				h="2rem"
				color="gray.6"
				leftSection={<IconPlus stroke={1.2} size="1rem" />}
				styles={{ label: { fontSize: '0.6rem' } }}>
				Add Axes
			</Button>
		</Box>
	);
};

const yKeysPath = 'visualization.graph_config.y_keys';
const colorConfigPath = 'visualization.color_config';

const YAxisConfig = (props: {
	form: TileFormType;
	y_key: string;
	index: number;
	totalKeys: number;
	y_keys: string[];
}) => {
	const {
		form: {
			values: {
				data: { fields = [] },
				visualization: { tick_config, color_config },
			},
		},
		y_key,
		index,
		totalKeys,
		y_keys,
	} = props;
	const colorInputRef = useRef<HTMLInputElement>(null);
	const tickConfigIndex = y_key === '' ? -1 : _.findIndex(tick_config, (e) => e.key === y_key);
	const unit = tickConfigIndex !== -1 ? tick_config[tickConfigIndex].unit : defaultTickUnit;
	const tickConfigPath = 'visualization.tick_config';
	const color = _.find(color_config, (obj) => obj.field_name === y_key)?.color_palette || 'gray';
	const colorInputValue = _.get(swatchesMap, color, undefined);
	const currentKeyPath = yKeysPath + '.' + index;
	const disableRemoveBtn = totalKeys === 1;
	const isInvalidKey = _.isEmpty(y_key) || y_key === null;

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

		onChangeUnit(null);
		props.form.removeListItem(yKeysPath, index);
	}, [yKeysPath, index, disableRemoveBtn, onChangeUnit]);

	const onChangeAxis = useCallback(
		(value: string | null) => {
			props.form.setFieldValue(currentKeyPath, value);
			const updatedColorConfig = genColorConfig(_.compact([...y_keys, value]), color_config);
			props.form.setFieldValue(colorConfigPath, updatedColorConfig);
		},
		[currentKeyPath],
	);

	const onChangeColor = useCallback(
		(color: string) => {
			const tempColorConfig = [...color_config];
			const currentKeyConfigIndex = _.findIndex(color_config, (obj) => obj.field_name === y_key);
			const colorPalette = _.findKey(swatchesMap, (swatchMap) => swatchMap === color);
			const updatedConfig = { field_name: y_key, color_palette: colorPalette || 'gray' };
			if (currentKeyConfigIndex === -1) {
				[...tempColorConfig, updatedConfig];
			} else {
				tempColorConfig[currentKeyConfigIndex] = updatedConfig;
			}
			return props.form.setFieldValue(colorConfigPath, tempColorConfig);
		},
		[color_config, y_key],
	);

	return (
		<Stack style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
			<Select
				data={_.map(fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				placeholder="Y Axis"
				label={index !== 0 ? null : 'Y Axis'}
				key={currentKeyPath}
				{...props.form.getInputProps(currentKeyPath)}
				style={{ width: '50%' }}
				styles={{ input: isInvalidKey ? { border: '1px solid red' } : {} }}
				error={null} // the validation on useTileForm prevents submission
				onChange={onChangeAxis}
			/>
			<Select
				data={_.map([defaultTickUnit, ...tickUnits], (unit) => ({ label: unit, value: unit }))}
				classNames={{ label: classes.fieldTitle }}
				placeholder="Unit"
				label={index !== 0 ? null : 'Unit'}
				value={unit}
				style={{ width: '50%' }}
				onChange={onChangeUnit}
				disabled={isInvalidKey}
			/>
			<Stack
				onClick={() => colorInputRef?.current?.focus()}
				style={{ cursor: !isInvalidKey ? 'default' : 'not-allowed' }}>
				<ColorInput
					ref={colorInputRef}
					disabled={isInvalidKey}
					disallowInput
					withPicker={false}
					withEyeDropper={false}
					swatches={swatches}
					styles={{
						input: {
							fontSize: '0rem',
							paddingInlineEnd: '0rem',
						},
					}}
					value={colorInputValue}
					onChange={onChangeColor}
				/>
			</Stack>
			<ActionIcon onClick={onRemoveKey} disabled={disableRemoveBtn} variant="light" style={{ marginBottom: '0.3rem' }}>
				<CloseIcon />
			</ActionIcon>
		</Stack>
	);
};

const orientationPath = 'visualization.graph_config.orientation';

const OrientationConfig = (props: { form: TileFormType }) => {
	const {
		form: {
			values: {
				visualization: { graph_config },
			},
		},
	} = props;
	const orientation = _.get(graph_config, 'orientation', defaultOrientationType);
	const onChange = useCallback((value: string | null) => {
		if (value !== null) {
			props.form.setFieldValue(orientationPath, value);
		}
	}, []);
	return (
		<Select
			data={orientationTypes}
			classNames={{ label: classes.fieldTitle }}
			placeholder="Unit"
			label="Orientation Config"
			value={orientation}
			style={{ width: '50%' }}
			onChange={onChange}
		/>
	);
};

const graphTypePath = 'visualization.graph_config.graph_type';

const GraphTypeConfig = (props: { form: TileFormType }) => {
	const {
		form: {
			values: {
				visualization: { graph_config },
			},
		},
	} = props;
	const graphType = _.get(graph_config, 'graph_type', defaultGraphType);
	const onChange = useCallback((value: string | null) => {
		if (value !== null) {
			props.form.setFieldValue(graphTypePath, value);
		}
	}, []);
	return (
		<Select
			data={graphTypes}
			classNames={{ label: classes.fieldTitle }}
			placeholder="Unit"
			label="Type"
			value={graphType}
			style={{ width: '50%' }}
			onChange={onChange}
		/>
	);
};

const GraphConfig = (props: { form: TileFormType }) => {
	const {
		form: {
			values: {
				visualization: { graph_config, visualization_type },
				data: { fields },
			},
		},
	} = props;

	const y_keys = _.get(graph_config, 'y_keys', []);
	const addAxes = useCallback(() => {
		if (!_.head(fields)) return;

		props.form.insertListItem(yKeysPath, null);
	}, [fields]);

	useEffect(() => {
		if (_.isEmpty(y_keys) || !_.isArray(y_keys)) {
			addAxes();
		}
	}, [y_keys]);

	return (
		<Stack>
			<Stack>
				<Stack style={{ flexDirection: 'row' }}>
					{!isLineChart(visualization_type) && <GraphTypeConfig form={props.form} />}
					<OrientationConfig form={props.form} />
				</Stack>
				<XAxisConfig form={props.form} />
				<Stack gap={2}>
					<Stack>
						{_.map(y_keys, (y_key, index) => {
							return (
								<YAxisConfig
									form={props.form}
									y_key={y_key}
									index={index}
									key={index}
									totalKeys={_.size(y_keys)}
									y_keys={y_keys}
								/>
							);
						})}
					</Stack>
				</Stack>
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
			<Stack gap={28}>
				<BasicConfig form={props.form} />
				<ChartConfig form={props.form} />
			</Stack>
		</Stack>
	);
};

const VizEditorModal = (props: { form: TileFormType }) => {
	const { form } = props;
	const [vizEditorModalOpen] = useDashboardsStore((store) => store.vizEditorModalOpen);
	const [, setDashboardStore] = useDashboardsStore(() => null);
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
				<Stack style={{ justifyContent: 'space-between', flex: 1, height: 'auto' }}>
					<ScrollArea style={{ flex: 1 }} offsetScrollbars>
						<Config form={form} />
					</ScrollArea>
					<Stack style={{ alignItems: 'flex-end', margin: '1rem', marginBottom: '1.5rem', marginRight: '0.5rem' }}>
						<Button onClick={closeVizModal}>Done</Button>
					</Stack>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default VizEditorModal;
