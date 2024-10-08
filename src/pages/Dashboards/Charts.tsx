import {
	BarChartProps,
	barChartBasicTypes,
	CommonGraphVizProps,
	TileQueryResponse,
	UnitType,
	CommonGraphOrientationType,
	CommonGraphBasicType,
	defaultBarChartBasicType,
	barChartOrientationTypes,
	defaultBarChartOrientationType,
	LineChartProps,
	lineChartOrientationTypes,
	defaultLineChartOrientation,
	AreaChartProps,
	areaChartBasicTypes,
	areaChartOrientationTypes,
	defaultAreaChartBasicType,
	defaultAreaChartOrientationType,
	ColorConfig,
} from '@/@types/parseable/api/dashboards';
import { AreaChart, BarChart, DonutChart, LineChart, PieChart, getFilteredChartTooltipPayload } from '@mantine/charts';
import { Paper, Stack, Text } from '@mantine/core';
import _ from 'lodash';
import { circularChartTypes, graphTypes } from '@/@types/parseable/api/dashboards';
import { IconAlertTriangle } from '@tabler/icons-react';
import classes from './styles/Charts.module.css';
import { CodeHighlight } from '@mantine/code-highlight';
import { Log } from '@/@types/parseable/api/query';
import { tickFormatter } from './utils';
import { useCallback } from 'react';

export const chartColorsMap = {
	black: 'dark.5',
	gray: 'gray.5',
	red: 'red.5',
	pink: 'pink.5',
	grape: 'grape.5',
	violet: 'violet.5',
	indigo: 'indigo.5',
	cyan: 'cyan.5',
	blue: 'blue.5',
	teal: 'teal.5',
	green: 'green.5',
	lime: 'lime.5',
	yellow: 'yellow.5',
	orange: 'orange.5',
};

export const colors = [
	'indigo',
	'cyan',
	'teal',
	'yellow',
	'grape',
	'violet',
	'blue',
	'pink',
	'lime',
	'orange',
	'red',
	'green',
];

export const nullColor = 'gray';

export const getGraphVizComponent = (viz: string) => {
	if (viz === 'line-chart') {
		return Line;
	} else if (viz === 'bar-chart') {
		return Bar;
	} else if (viz === 'area-chart') {
		return Area;
	} else {
		return null;
	}
};

export const getCircularVizComponent = (viz: string) => {
	if (viz === 'donut-chart') {
		return Donut;
	} else if (viz === 'pie-chart') {
		return Pie;
	} else {
		return null;
	}
};

export type CircularChartData = {
	name: string;
	value: number;
	color: string;
}[];

export const isCircularChart = (viz: string) => _.includes(circularChartTypes, viz);
export const isGraph = (viz: string) => _.includes(graphTypes, viz);
export const isLineChart = (viz: string) => viz === 'line-chart';

const invalidConfigMsg = 'Invalid chart config';
const noDataMsg = 'No data available';
const invalidDataMsg = 'Invalid chart data';

const WarningView = (props: { msg: string | null }) => {
	return (
		<Stack
			style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}
			className={classes.warningViewContainer}>
			<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>{props.msg}</Text>
		</Stack>
	);
};

const validateCircularChartData = (data: CircularChartData) => {
	return _.every(data, (d) => _.isNumber(d.value));
};

export const renderCircularChart = (opts: {
	queryResponse: TileQueryResponse | null;
	name_key: string;
	value_key: string;
	chart: string;
	unit: UnitType;
}) => {
	const { queryResponse, name_key, value_key, chart, unit } = opts;

	const VizComponent = getCircularVizComponent(chart);
	const data = makeCircularChartData(queryResponse?.records || [], name_key, value_key);

	const isInvalidKey = _.isEmpty(name_key) || _.isEmpty(value_key);
	const hasNoData = _.isEmpty(data);
	const isValidData = validateCircularChartData(data);
	const warningMsg = isInvalidKey ? invalidConfigMsg : hasNoData ? noDataMsg : !isValidData ? invalidDataMsg : null;

	return (
		<Stack style={{ flex: 1, height: '100%' }}>
			{warningMsg ? <WarningView msg={warningMsg} /> : VizComponent ? <VizComponent data={data} unit={unit} /> : null}
		</Stack>
	);
};

export const renderJsonView = (opts: { queryResponse: TileQueryResponse | null }) => {
	return (
		<Stack>
			<CodeHighlight
				code={JSON.stringify(opts.queryResponse?.records || [], null, 2)}
				style={{ background: 'white' }}
				language="json"
				styles={{ copy: { marginLeft: '550px' } }}
				copyLabel="Copy Records"
			/>
		</Stack>
	);
};

export const renderGraph = (opts: {
	queryResponse: TileQueryResponse | null;
	x_key: string;
	y_keys: string[];
	chart: string;
	xUnit: UnitType;
	yUnit: UnitType;
	orientation: CommonGraphOrientationType;
	graphBasicType: CommonGraphBasicType;
	color_config: ColorConfig[];
}) => {
	const { queryResponse, x_key, y_keys, chart, xUnit, yUnit, color_config } = opts;
	const VizComponent = getGraphVizComponent(chart);
	const seriesData = makeSeriesData(queryResponse?.records || [], y_keys, color_config);
	const data = queryResponse?.records || [];
	const isInvalidKey = _.isEmpty(x_key) || _.isEmpty(y_keys);
	const hasNoData = _.isEmpty(seriesData) || _.isEmpty(data);
	const warningMsg = isInvalidKey ? invalidConfigMsg : hasNoData ? noDataMsg : null;

	const vizOpts = {
		data,
		dataKey: x_key,
		series: seriesData,
		xUnit,
		yUnit,
		graphBasicType: opts.graphBasicType,
		orientation: opts.orientation,
	};

	return (
		<Stack style={{ flex: 1, height: '100%', padding: '1rem' }}>
			{warningMsg ? <WarningView msg={warningMsg} /> : VizComponent ? <VizComponent {...vizOpts} /> : null}
		</Stack>
	);
};

export const makeCircularChartData = (data: Log[], name_key: string, value_key: string): CircularChartData => {
	if (!_.isArray(data)) return [];

	const topN = 5;
	const chartData = _.reduce(
		data,
		(acc, rec: Log) => {
			if (!_.has(rec, name_key) || !_.has(rec, value_key)) {
				return acc;
			}

			const key = _.toString(rec[name_key]);
			return {
				...acc,
				[key]: rec[value_key],
			};
		},
		{},
	);
	const topNKeys = _.keys(chartData).slice(0, topN);
	const topNObject = _.pick(chartData, topNKeys);
	const restObject = _.omit(chartData, topNKeys);

	let usedColors: string[] = [];
	const { topNArcs } = _.reduce(
		topNObject,
		(acc: { topNArcs: CircularChartData; index: number }, value, key) => {
			const { topNArcs, index } = acc;
			const colorkey = _.difference(colors, usedColors)[index] || nullColor;
			usedColors = [...usedColors, colorkey];
			const colorKey = _.difference(colors, usedColors)[index] || nullColor;
			const color = colorKey in chartColorsMap ? chartColorsMap[colorKey as keyof typeof chartColorsMap] : nullColor;
			return { topNArcs: [...topNArcs, { name: key, value, color: color || 'gray.4' }], index: index + 1 };
		},
		{ topNArcs: [], index: 0 },
	);

	const restArcValue = _.sum(_.values(restObject));
	return [...topNArcs, ...(restArcValue !== 0 ? [{ name: 'Others', value: restArcValue, color: 'gray.4' }] : [])];
};

export const normalizeGraphColorConfig = (y_keys: string[], colorConfig: ColorConfig[]): Record<string, string> => {
	const saniitizedKeys = _.compact(y_keys);
	const fieldColorMap = _.reduce(
		colorConfig,
		(acc, conf) => {
			return { ...acc, [conf.field_name]: conf.color_palette };
		},
		{},
	);
	const allPickedColors = _.chain(colorConfig).map('color_palette').uniq().value();
	const remainingColors = _.difference(colors, allPickedColors);
	const reorderedColorsToAssign = [...remainingColors, ...allPickedColors];
	return _.reduce(
		saniitizedKeys,
		(acc, y_key: string, index: number) => {
			const colorFromConfig: string = _.get(fieldColorMap, y_key);
			const palette = colorFromConfig ? colorFromConfig : reorderedColorsToAssign[index] || nullColor;
			return { ...acc, [y_key]: palette || 'gray' };
		},
		{},
	);
};

const makeSeriesData = (data: Log[], y_keys: string[], color_config: ColorConfig[]) => {
	if (!_.isArray(data)) return [];

	const normalizedColorConfig = normalizeGraphColorConfig(y_keys, color_config);
	return _.reduce<string, { color: string; name: string }[]>(
		y_keys,
		(acc, key: string) => {
			const palette = normalizedColorConfig[key] || 'gray';
			const colorCode = palette in chartColorsMap ? chartColorsMap[palette as keyof typeof chartColorsMap] : nullColor;

			return [...acc, { color: colorCode || 'gray.4', name: key }];
		},
		[],
	);
};

const Donut = (props: { data: CircularChartData; unit: UnitType }) => {
	return <DonutChart withLabelsLine={false} thickness={30} withLabels data={props.data} h="100%" w="100%" />;
};

const Pie = (props: { data: CircularChartData; unit: UnitType }) => {
	return (
		<PieChart
			withLabelsLine={false}
			withLabels
			data={props.data}
			h="100%"
			w="100%"
			withTooltip
			tooltipDataSource="all"
		/>
	);
};

interface ChartTooltipProps {
	label: string;
	payload: Record<string, any>[] | undefined;
	xUnit: UnitType;
	yUnit: UnitType;
	chartType: 'line' | 'bar' | 'area' | 'donut' | 'pie';
}

function ChartTooltip({ label, payload, xUnit, yUnit, chartType }: ChartTooltipProps) {
	if (!payload) return null;

	const sanitizedPayload = chartType === 'area' ? getFilteredChartTooltipPayload(payload) : payload;
	return (
		<Paper px="md" py="sm" withBorder shadow="md" radius="md">
			<Text fw={600} mb={5}>
				{tickFormatter(label, xUnit)}
			</Text>
			<Stack gap={4}>
				{sanitizedPayload.map((item: any, index: number) => {
					const { name = '', value = null } = item;
					return (
						<Stack key={index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={{ fontSize: '0.7rem' }}>{name}</Text>
							<Text style={{ fontSize: '0.7rem' }}>{tickFormatter(value, yUnit)}</Text>
						</Stack>
					);
				})}
			</Stack>
		</Paper>
	);
}

const sanitizeLineChartProps = (opts: CommonGraphVizProps): LineChartProps => {
	const { data, dataKey, series, xUnit, yUnit, orientation } = opts;
	return {
		data,
		dataKey,
		series,
		xUnit,
		yUnit,
		orientation:
			orientation && _.includes(lineChartOrientationTypes, orientation) ? orientation : defaultLineChartOrientation,
	};
};

const Line = (props: CommonGraphVizProps) => {
	const opts = sanitizeLineChartProps(props);
	const xTicksFormatter = useCallback((value: any) => tickFormatter(value, opts.xUnit), [opts.xUnit]);
	const yTicksFormatter = useCallback((value: any) => tickFormatter(value, opts.yUnit), [opts.yUnit]);
	return (
		<LineChart
			h="100%"
			w="100%"
			withLegend
			data={opts.data}
			orientation={opts.orientation}
			dataKey={opts.dataKey}
			curveType="linear"
			series={opts.series}
			yAxisProps={{
				tickFormatter: opts.orientation === 'horizontal' ? yTicksFormatter : xTicksFormatter,
			}}
			xAxisProps={{
				tickFormatter: opts.orientation === 'horizontal' ? xTicksFormatter : yTicksFormatter,
			}}
			tooltipProps={{
				content: ({ label, payload }) => (
					<ChartTooltip label={label} payload={payload} xUnit={opts.xUnit} yUnit={props.yUnit} chartType="line" />
				),
			}}
		/>
	);
};

const sanitizeBarChartProps = (opts: CommonGraphVizProps): BarChartProps => {
	const { data, dataKey, series, xUnit, yUnit, graphBasicType: type, orientation } = opts;
	return {
		data,
		dataKey,
		series,
		xUnit,
		yUnit,
		type: type && _.includes(barChartBasicTypes, type) ? type : defaultBarChartBasicType,
		orientation:
			orientation && _.includes(barChartOrientationTypes, orientation) ? orientation : defaultBarChartOrientationType,
	};
};

const Bar = (props: CommonGraphVizProps) => {
	const opts: BarChartProps = sanitizeBarChartProps(props);
	const xTicksFormatter = useCallback((value: any) => tickFormatter(value, opts.xUnit), [opts.xUnit]);
	const yTicksFormatter = useCallback((value: any) => tickFormatter(value, opts.yUnit), [opts.yUnit]);
	return (
		<BarChart
			h="100%"
			w="100%"
			type={opts.type}
			withLegend
			data={opts.data}
			orientation={opts.orientation}
			dataKey={opts.dataKey}
			series={opts.series}
			yAxisProps={{
				tickFormatter: opts.orientation === 'horizontal' ? yTicksFormatter : xTicksFormatter,
			}}
			xAxisProps={{
				tickFormatter: opts.orientation === 'horizontal' ? xTicksFormatter : yTicksFormatter,
			}}
			tooltipProps={{
				content: ({ label, payload }) => (
					<ChartTooltip label={label} payload={payload} xUnit={opts.xUnit} yUnit={opts.yUnit} chartType="bar" />
				),
			}}
		/>
	);
};

const sanitizeAreaChartProps = (opts: CommonGraphVizProps): AreaChartProps => {
	const { data, dataKey, series, xUnit, yUnit, graphBasicType: type, orientation } = opts;
	return {
		data,
		dataKey,
		series,
		xUnit,
		yUnit,
		type: type && _.includes(areaChartBasicTypes, type) ? type : defaultAreaChartBasicType,
		orientation:
			orientation && _.includes(areaChartOrientationTypes, orientation) ? orientation : defaultAreaChartOrientationType,
	};
};

const Area = (props: CommonGraphVizProps) => {
	const opts: AreaChartProps = sanitizeAreaChartProps(props);
	const xTicksFormatter = useCallback((value: any) => tickFormatter(value, opts.xUnit), [opts.xUnit]);
	const yTicksFormatter = useCallback((value: any) => tickFormatter(value, opts.yUnit), [opts.yUnit]);
	return (
		<AreaChart
			h="100%"
			w="100%"
			withLegend
			type={opts.type}
			orientation={opts.orientation}
			data={opts.data}
			dataKey={opts.dataKey}
			series={opts.series}
			yAxisProps={{
				tickFormatter: opts.orientation === 'horizontal' ? yTicksFormatter : xTicksFormatter,
			}}
			xAxisProps={{
				tickFormatter: opts.orientation === 'horizontal' ? xTicksFormatter : yTicksFormatter,
			}}
			tooltipProps={{
				content: ({ label, payload }) => (
					<ChartTooltip label={label} payload={payload} xUnit={opts.xUnit} yUnit={props.yUnit} chartType="area" />
				),
			}}
		/>
	);
};

const charts = {
	Donut,
};

export default charts;
