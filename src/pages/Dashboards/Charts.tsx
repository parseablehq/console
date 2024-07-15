import { DonutChart } from '@mantine/charts';
import _ from 'lodash';

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
		return charts.Donut;
	}
};

export type DonutData = {
	name: string;
	value: number;
	color: string;
}[];

type RawData = {
	[key: string]: number;
	[key: number]: number;
};

export const sanitizeDonutData = (data: RawData[], colorConfig: {[key: string]: string}): DonutData => {
	if (!_.isArray(data)) return [];
	if (!_.isObject(data[0])) return [];

	const firstRecord = data[0] || {};
	const topNKeys = _.keys(firstRecord).slice(0, 5);
	const topNObject = _.pick(firstRecord, topNKeys);
	const restObject = _.omit(firstRecord, topNKeys);

	let usedColors: string[] = [];
	const topNArcs = _.reduce(
		topNObject,
		(acc: DonutData, value, key) => {
			const color = colorConfig[key] || _.sample(_.difference(colors, usedColors)) || nullColor;
			usedColors = [...usedColors, color];
			return [...acc, { name: key, value, color: chartColorsMap[color] || 'gray.6' }];
		},
		[],
	);

	const restArcValue = _.sum(_.values(restObject));
	return [...topNArcs, { name: 'Others', value: restArcValue, color: 'gray.6' }];
}

const Donut = (props: { data: DonutData }) => {
	return <DonutChart withLabelsLine={false} thickness={30} withLabels data={props.data} h="100%" w="100%" />;
};

const charts = {
	Donut,
};

export default charts;
