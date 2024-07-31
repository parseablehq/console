import { Modal, MultiSelect, Select, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/VizEditor.module.css';
import { useDashboardsStore, Visualization, dashboardsStoreReducers, tileSizes, circularChartTypes } from './providers/DashboardsProvider';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useCallback, useEffect, useState } from 'react';
import { visualizations } from './providers/DashboardsProvider';
import _ from 'lodash';
import { colors as defaultColors, DonutData, isCircularChart, renderCircularChart, renderGraph, sanitizeDonutData, sanitizeDonutData2 } from './Charts';
import charts from './Charts';
import { FormOpts, TileFormType, TileQuery, TileQueryResponse } from '@/@types/parseable/api/dashboards';
import { IconAlertTriangle } from '@tabler/icons-react';
import TableViz from './Table';
const {toggleVizEditorModal} = dashboardsStoreReducers;

const inValidVizType = 'Select a visualization type';

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
		visualization: { type, circularChartConfig },
		data,
	} = props.form.values;
	const nameKey = _.get(circularChartConfig, 'nameKey', '');
	const valueKey = _.get(circularChartConfig, 'valueKey', '');

	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderCircularChart({ queryResponse: data, nameKey, valueKey, chart: type })}
		</Stack>
	);
};

const Graph = (props: { form: TileFormType }) => {
	const {
		visualization: { type, graphConfig },
		data,
	} = props.form.values;
	const xKey = _.get(graphConfig, 'xAxis', '');
	const yKeys = _.get(graphConfig, 'yAxis', []);
	return (
		<Stack style={{ flex: 1, width: '100%' }}>{renderGraph({ queryResponse: data, xKey, yKeys, chart: type })}</Stack>
	);
};

const Table = (props: {form: TileFormType }) => {
	const data = props.form.values.data;
	return (
		<Stack style={{ width: '100%', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
			<Stack className={classes.tableContainer} style={{ width: '100%', height: '90%' }}>
				<TableViz data={data} />
			</Stack>
		</Stack>
	);
};

export const Viz = (props: {form: TileFormType}) => {
    const {form: {values: {visualization, data}}} = props;

	const {type} = visualization;
	const isValidVizType = _.includes(visualizations, type);
	const showWarning = !isValidVizType;
	const Viss = type === 'table' ? Table : isCircularChart(type) ? CircularChart : Graph;

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
    'table': 'Table',
    'line-chart': 'Line Chart',
    'bar-chart': 'Bar Chart',
	'area-chart': 'Area Chart'
}

const sizeLabelMap = {
   'sm': 'Small',
   'md': 'Medium',
   'lg': 'Large',
   'xl': 'Full'
}

const BasicConfig = (props: {form: TileFormType}) => {
	useEffect(() => {
		props.form.validate();
	}, [props.form.values.visualization.type])

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
					key="visualization.type"
					{...props.form.getInputProps('visualization.type')}
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
}

const CircularChartConfig = (props: {form: TileFormType}) => {
	const {form: {values: {data}, errors}} = props;

	return (
		<Stack style={{ flexDirection: 'row' }}>
			<Select
				data={_.map(data?.fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				label="Name"
				placeholder="Name"
				key="visualization.circularChartConfig.nameKey"
				{...props.form.getInputProps('visualization.circularChartConfig.nameKey')}
				style={{ width: '50%' }}
			/>
			<Select
				data={_.map(data?.fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				label="Value"
				placeholder="Value"
				key="visualization.circularChartConfig.valueKey"
				{...props.form.getInputProps('visualization.circularChartConfig.valueKey')}
				style={{ width: '50%' }}
			/>
		</Stack>
	);
}

const GraphConfig = (props: {form: TileFormType}) => {
	const {form: {values: {data}}} = props;

	return (
		<Stack>
			<Select
				data={_.map(data?.fields, (field) => ({ label: field, value: field }))}
				classNames={{ label: classes.fieldTitle }}
				label="X Axis"
				placeholder="X Axis"
				key="visualization.graphConfig.xAxis"
				{...props.form.getInputProps('visualization.graphConfig.xAxis')}
				style={{ width: '50%' }}
			/>
			<MultiSelect
				data={data?.fields}
				classNames={{ label: classes.fieldTitle }}
				label="Y Axis"
				placeholder="Y Axis"
				key="visualization.graphConfig.yAxis"
				{...props.form.getInputProps('visualization.graphConfig.yAxis')}
				style={{ width: '50%' }}
				limit={6}
			/>
		</Stack>
	);
}

const TickConfig = (props: {form: TileFormType}) => {
	if (props.form.values.visualization.type === 'table' || _.isEmpty(props.form.values.visualization.type)) return null;

	return (
		<Stack gap={4}>
			<Text className={classes.fieldTitle} style={{ marginBottom: '0.25rem', fontSize: '0.8rem', fontWeight: 500 }}>
				Chart Config
			</Text>
			{/* debug */}
			{isCircularChart(props.form.values.visualization.type) ? (
				<CircularChartConfig form={props.form} />
			) : (
				<GraphConfig form={props.form} />
			)}
		</Stack>
	);
}

const Config = (props: {form: TileFormType, updateColors: (key: string, value: string) => void;}) => {
	return (
		<Stack className={classes.configContainer}>
			<Stack gap={28}>
				<BasicConfig form={props.form}/>
				<TickConfig form={props.form}/> 
				{/* <Stack gap={2}>
					<Text className={classes.fieldTitle}>Colors</Text>
					<Stack>
						{_.map(dataKeys, (dataKey) => {
							return (
								<Stack style={{flexDirection: 'row'}}>
									<TextInput value={dataKey} w="40%" disabled />
									<Select
										data={[{label: 'Default', value: ''}, ..._.map(defaultColors, (color) => ({ label: _.capitalize(color), value: color }))]}
										w="40%"
                                        defaultValue=''
										value=''
                                        // value={colors[dataKey] || ''}
                                        onChange={color => props.updateColors(dataKey, color || '')}
									/>
								</Stack>
							);
						})}
					</Stack>
				</Stack> */}
			</Stack>
		</Stack>
	);
};

const useVizForm = (opts: Visualization) => {
	const form = useForm<Visualization>({
		mode: 'controlled',
		initialValues: opts,
		validate: {},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
	}, []);

	const updateColors = useCallback(
		(key: string, value: string) => {
			form.setFieldValue('colors', {
				...form.values.colors,
				[key]: value,
			});
		},
		[form],
	);

	return { form, onChangeValue, updateColors };
};

type VizFormReturnType = UseFormReturnType<Visualization, (values: Visualization) => Visualization>;

const VizEditorModal = (props: {form: TileFormType}) => {
	const {form} = props;
	const [vizEditorModalOpen] = useDashboardsStore((store) => store.vizEditorModalOpen);
	const [, setDashboardStore] = useDashboardsStore((_store) => null);
	const closeVizModal = useCallback(() => {
		setDashboardStore((store) => toggleVizEditorModal(store, false));
	}, []);
	return (
		<Modal
			opened={vizEditorModalOpen}
			onClose={closeVizModal}
			centered
			size="80rem"
			title={'Edit Visualization'}
			styles={{ body: { padding: '0 1rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			classNames={{ title: classes.modalTitle }}>
			<Stack className={classes.container}>
				<Stack style={{ width: '40%' }}>
					<Viz form={form} />
				</Stack>
				<Stack className={classes.divider} />
				<Config form={form} />
			</Stack>
		</Modal>
	);
};

export default VizEditorModal;
