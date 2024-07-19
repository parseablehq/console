import { TileData, TileQueryResponse, TileRecord } from '@/@types/parseable/api/dashboards';
import { DonutChart, PieChart } from '@mantine/charts';
import { Stack } from '@mantine/core';
import _ from 'lodash';
import { circularChartTypes } from './providers/DashboardsProvider';

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

export const colors = ['red', 'pink', 'grape', 'violet', 'indigo', 'cyan', 'blue', 'teal', 'green', 'lime', 'yellow', 'orange']
export const nullColor = 'gray'

export const getVizComponent = (viz: string) => {
	if (viz === 'donut-chart') {
		return Donut;
	} else if (viz === 'pie-chart') {
		return Pie;
	} else {
		return null;
	}
};

export type DonutData = {
	name: string;
	value: number;
	color: string;
}[];

export const isCircularChart = (viz: string) => _.includes(circularChartTypes, viz);

export const renderCircularChart = (opts: {queryResponse: TileQueryResponse | null, nameKey: string, valueKey: string, chart: 'donut-chart'}) => {
	const { queryResponse, nameKey, valueKey, chart } = opts;

	const VizComponent = getVizComponent(chart);
	const data = makeCircularChartData(queryResponse?.records || [], nameKey, valueKey);
	return <Stack style={{ flex: 1, height: '100%' }}>{VizComponent ? <VizComponent data={data} /> : null}</Stack>;
}

export const renderGraph = (opts: {queryResponse: TileQueryResponse | null, nameKey: string, valueKey: string, chart: 'donut-chart'}) => {
	const { queryResponse, nameKey, valueKey, chart } = opts;

	const VizComponent = getVizComponent(chart);
	const data = makeCircularChartData(queryResponse?.records || [], nameKey, valueKey);
	return <Stack style={{ flex: 1, height: '100%' }}>{VizComponent ? <VizComponent data={data} /> : null}</Stack>;
}

export const makeCircularChartData = (data: TileData | null, nameKey: string, valueKey: string): DonutData => {
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
	const topNArcs = _.reduce(
		topNObject,
		(acc: DonutData, value, key) => {
			const color = _.sample(_.difference(colors, usedColors)) || nullColor;
			usedColors = [...usedColors, color];
			return [...acc, { name: key, value, color: chartColorsMap[color] || 'gray.6' }];
		},
		[],
	);

	const restArcValue = _.sum(_.values(restObject));
	return [...topNArcs, ...(restArcValue !== 0 ? [{ name: 'Others', value: restArcValue, color: 'gray.6' }] : [])];
}

const Donut = (props: { data: DonutData }) => {
	return <DonutChart withLabelsLine={false} thickness={30} withLabels data={props.data} h="100%" w="100%" />;
};

const Pie = (props: { data: DonutData }) => {
	return <PieChart withLabelsLine={false} withLabels data={props.data} h="100%" w="100%" withTooltip tooltipDataSource="segment"/>;
};

const charts = {
	Donut,
};

export default charts;
