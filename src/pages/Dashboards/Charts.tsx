import { TileData, TileQueryResponse, TileRecord } from '@/@types/parseable/api/dashboards';
import { AreaChart, BarChart, DonutChart, LineChart, PieChart } from '@mantine/charts';
import { Stack, Text } from '@mantine/core';
import _ from 'lodash';
import { circularChartTypes, graphTypes } from './providers/DashboardsProvider';
import { IconAlertTriangle } from '@tabler/icons-react';
import classes from './styles/Charts.module.css'

export const chartColorsMap = {
	'black': 'dark.6',
	'gray': 'gray.6',
	'red': 'red.6',
	'pink': 'pink.6',
	'grape': 'grape.6',
	'violet': 'violet.6',
	'indigo': 'indigo.6',
	'cyan': 'cyan.6',
	'blue': 'blue.6',
	'teal': 'teal.6',
	'green': 'green.6',
	'lime': 'lime.6',
	'yellow': 'yellow.6',
	'orange': 'orange.6',
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

export const getVizComponent = (viz: string) => {
	if (viz === 'donut-chart') {
		return Donut;
	} else if (viz === 'pie-chart') {
		return Pie;
	} else if (viz === 'line-chart') {
		return Line;
	} else if (viz === 'bar-chart') {
		return Bar;
	} else if (viz === 'area-chart') {
		return Area;
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

export const renderCircularChart = (opts: {queryResponse: TileQueryResponse | null, nameKey: string, valueKey: string, chart: string }) => {
	const { queryResponse, nameKey, valueKey, chart } = opts;

	const VizComponent = getVizComponent(chart);
	const data = makeCircularChartData(queryResponse?.records || [], nameKey, valueKey);

	const isInvalidKey = _.isEmpty(nameKey) || _.isEmpty(valueKey);
	const hasNoData = _.isEmpty(data);
	const isValidData = validateCircularChartData(data);
	const warningMsg = isInvalidKey ? invalidConfigMsg : hasNoData ? noDataMsg : !isValidData ? invalidDataMsg : null;

	return (
		<Stack style={{ flex: 1, height: '100%', padding: '1rem 0rem'}}>
			{warningMsg ? <WarningView msg={warningMsg} /> : VizComponent ? <VizComponent data={data} /> : null}
		</Stack>
	);
}

export const renderGraph = (opts: {queryResponse: TileQueryResponse | null, xKey: string, yKeys: string[], chart}) => {
	const { queryResponse, xKey, yKeys, chart } = opts;
	const VizComponent = getVizComponent(chart);
	const seriesData = makeSeriesData(queryResponse?.records || [], yKeys);

	const data = queryResponse?.records || []
	const isInvalidKey = _.isEmpty(xKey) || _.isEmpty(yKeys);
	const hasNoData = _.isEmpty(seriesData) || _.isEmpty(data);
	const warningMsg = isInvalidKey ? invalidConfigMsg : hasNoData ? noDataMsg : null;

	return (
		<Stack style={{ flex: 1, height: '100%', padding: '1rem' }}>
			{warningMsg ? <WarningView msg={warningMsg} /> : VizComponent ? <VizComponent data={data} dataKey={xKey} series={seriesData}/> : null}
		</Stack>
	);

	// return (
	// 	<Stack style={{ flex: 1, height: '100%', padding: '1rem' }}>
	// 		{VizComponent ? <VizComponent data={queryResponse?.records || []} dataKey={xKey} series={seriesData} /> : null}
	// 	</Stack>
	// );
}

export const makeCircularChartData = (data: TileData | null, nameKey: string, valueKey: string): CircularChartData => {
	if (!_.isArray(data)) return [];

	const topN = 5;
	const chartData = _.reduce(
		data,
		(acc, rec: TileRecord) => {
			if (!_.has(rec, nameKey) || !_.has(rec, valueKey)) {
				return acc;
			}

			return {
				...acc,
				[rec[nameKey]]: rec[valueKey],
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
			const color = _.difference(colors, usedColors)[index] || nullColor;
			usedColors = [...usedColors, color];
			return { topNArcs: [...topNArcs, { name: key, value, color: chartColorsMap[color] || 'gray.6' }], index: index + 1 };
		},
		{ topNArcs: [], index: 0 },
	);

	const restArcValue = _.sum(_.values(restObject));
	return [...topNArcs, ...(restArcValue !== 0 ? [{ name: 'Others', value: restArcValue, color: 'gray.6' }] : [])];
}

const makeSeriesData = (data: TileData | null, yKeys: string[]) => {
	if (!_.isArray(data)) return [];

	let usedColors: string[] = [];

	return _.reduce<string, { color: string; name: string }[]>(
		yKeys,
		(acc, key: string, index: number) => {
			const color =  _.difference(colors, usedColors)[index] || nullColor;
			return [...acc, { color: chartColorsMap[color] || 'gray.6', name: key }];
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
		<AreaChart withLegend data={props.data} dataKey={props.dataKey}  series={props.series} />
	);
};

const charts = {
	Donut,
};

export default charts;
