import { TileData, TileQueryResponse } from '@/@types/parseable/api/dashboards';
import { AreaChart, BarChart, DonutChart, LineChart, PieChart } from '@mantine/charts';
import { Stack, Text } from '@mantine/core';
import _ from 'lodash';
import { circularChartTypes, graphTypes } from '@/@types/parseable/api/dashboards';
import { IconAlertTriangle } from '@tabler/icons-react';
import classes from './styles/Charts.module.css'
import { CodeHighlight } from '@mantine/code-highlight';
import { Log } from '@/@types/parseable/api/query';

export const chartColorsMap = {
	'black': 'dark.5',
	'gray': 'gray.5',
	'red': 'red.5',
	'pink': 'pink.5',
	'grape': 'grape.5',
	'violet': 'violet.5',
	'indigo': 'indigo.5',
	'cyan': 'cyan.5',
	'blue': 'blue.5',
	'teal': 'teal.5',
	'green': 'green.5',
	'lime': 'lime.5',
	'yellow': 'yellow.5',
	'orange': 'orange.5',
}

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
export const nullColor = 'gray'

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

export type SeriesType = {
	name: string;
	color: string;
}[];

export const isCircularChart = (viz: string) => _.includes(circularChartTypes, viz);
export const isGraph = (viz: string) => _.includes(graphTypes, viz);

const invalidConfigMsg = "Invalid chart config"
const noDataMsg = "No data available"
const invalidDataMsg = "Invalid chart data"

const WarningView = (props: { msg: string | null }) => {
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }} className={classes.warningViewContainer}>
				<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
				<Text className={classes.warningText}>{props.msg}</Text>
		</Stack>
	);
};

const validateCircularChartData = (data: CircularChartData) => {
	return _.every(data, d => _.isNumber(d.value))
}

export const renderCircularChart = (opts: {queryResponse: TileQueryResponse | null, name_key: string, value_key: string, chart: string }) => {
	const { queryResponse, name_key, value_key, chart } = opts;

	const VizComponent = getCircularVizComponent(chart);
	const data = makeCircularChartData(queryResponse?.records || [], name_key, value_key);

	const isInvalidKey = _.isEmpty(name_key) || _.isEmpty(value_key);
	const hasNoData = _.isEmpty(data);
	const isValidData = validateCircularChartData(data);
	const warningMsg = isInvalidKey ? invalidConfigMsg : hasNoData ? noDataMsg : !isValidData ? invalidDataMsg : null;

	return (
		<Stack style={{ flex: 1, height: '100%'}}>
			{warningMsg ? <WarningView msg={warningMsg} /> : VizComponent ? <VizComponent data={data} /> : null}
		</Stack>
	);
}

export const renderJsonView = (opts: {queryResponse: TileQueryResponse | null}) => {
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
}

export const renderGraph = (opts: {queryResponse: TileQueryResponse | null, x_key: string, y_keys: string[], chart: string}) => {
	const { queryResponse, x_key, y_keys, chart } = opts;
	const VizComponent = getGraphVizComponent(chart);
	const seriesData = makeSeriesData(queryResponse?.records || [], y_keys);

	const data = queryResponse?.records || []
	const isInvalidKey = _.isEmpty(x_key) || _.isEmpty(y_keys);
	const hasNoData = _.isEmpty(seriesData) || _.isEmpty(data);
	const warningMsg = isInvalidKey ? invalidConfigMsg : hasNoData ? noDataMsg : null;

	return (
		<Stack style={{ flex: 1, height: '100%', padding: '1rem' }}>
			{warningMsg ? <WarningView msg={warningMsg} /> : VizComponent ? <VizComponent data={data} dataKey={x_key} series={seriesData}/> : null}
		</Stack>
	);
}

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
}

const makeSeriesData = (data: Log[], y_key: string[]) => {
	if (!_.isArray(data)) return [];

	let usedColors: string[] = [];

	return _.reduce<string, { color: string; name: string }[]>(
		y_key,
		(acc, key: string, index: number) => {
			const colorKey =  _.difference(colors, usedColors)[index] || nullColor;
			const color = colorKey in chartColorsMap ? chartColorsMap[colorKey as keyof typeof chartColorsMap] : nullColor;
			return [...acc, { color: color || 'gray.4', name: key }];
		},
		[],
	);
}

const Donut = (props: { data: CircularChartData }) => {
	return <DonutChart withLabelsLine={false} thickness={30} withLabels data={props.data} h="100%" w="100%" />;
};

const Pie = (props: { data: CircularChartData }) => {
	return <PieChart withLabelsLine={false} withLabels data={props.data} h="100%" w="100%" withTooltip tooltipDataSource="segment"/>;
};

const Line = (props: { data: TileData; dataKey: string; series: SeriesType }) => {
	return (
		<LineChart h="100%" w="100%" withLegend data={props.data} dataKey={props.dataKey} curveType="linear" series={props.series} />
	);
};

const Bar = (props: { data: TileData; dataKey: string; series: SeriesType }) => {
	return (
		<BarChart h="100%" w="100%" type="stacked" withLegend data={props.data} dataKey={props.dataKey}  series={props.series} />
	);
};

const Area = (props: { data: TileData; dataKey: string; series: SeriesType }) => {
	return (
		<AreaChart h="100%" w="100%" withLegend data={props.data} dataKey={props.dataKey}  series={props.series} />
	);
};

const charts = {
	Donut,
};

export default charts;
