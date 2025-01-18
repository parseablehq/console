import React from 'react';
import { Line } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	ChartOptions,
	Filler,
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import { HumanizeNumber } from '@/utils/formatBytes';
import timeRangeUtils from '@/utils/timeRangeUtils';

const { makeTimeRangeLabel } = timeRangeUtils;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Annotation, Filler, zoomPlugin);

interface ChartComponentProps {
	graphData: any;
	avgEventCount: number;
	setTimeRangeFromGraph: (minute: string) => void;
	hasData: boolean;
	onZoomOrPanComplete: (startTime: string, endTime: string) => void;
}

const AreaChartComponent: React.FC<ChartComponentProps> = ({
	graphData,
	avgEventCount,
	setTimeRangeFromGraph,
	hasData,
	onZoomOrPanComplete,
}) => {
	const chartData = {
		labels: graphData.map((item: any) => item.minute),
		datasets: [
			{
				label: 'Events',
				data: graphData.map((item: any) => item.events),
				fill: true,
				// backgroundColor: 'rgba(99, 102, 241, 0.5)',
				borderColor: 'rgb(99, 102, 241)',
				borderWidth: 1.25,
				pointRadius: 2.5,
				pointBorderWidth: 1,
				pointBackgroundColor: 'rgb(99, 102, 241)',
				tension: 0.4,
				backgroundColor: (context: any) => {
					const ctx = context.chart.ctx;
					const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
					gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
					gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
					return gradient;
				},
			},
		],
	};

	const handleRangeComplete = (chart: any) => {
		const { min, max } = chart.scales.x;
		const startIndex = Math.floor(min);
		const endIndex = Math.ceil(max);
		// Get the time range for the zoomed area
		if (startIndex >= 0 && endIndex < graphData.length) {
			const startTime = graphData[startIndex].startTime;
			const endTime = graphData[endIndex].endTime;
			onZoomOrPanComplete(startTime, endTime);
		}
	};

	const chartOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			tooltip: {
				position: 'nearest',
				backgroundColor: 'white',
				titleColor: 'black',
				bodyColor: 'black',
				footerColor: 'black',
				borderColor: 'rgb(99, 102, 241)',
				borderWidth: 1,
				callbacks: {
					title: (tooltipItems: any) => {
						const index = tooltipItems[0].dataIndex;
						const { startTime, endTime } = graphData[index];
						return makeTimeRangeLabel(new Date(startTime), new Date(endTime));
					},
					label: (tooltipItem: any) => {
						return `Events: ${new Intl.NumberFormat('en-US').format(tooltipItem.raw)}`;
					},
					// footer: (tooltipItems: any) => {
					// 	const index = tooltipItems[0].dataIndex;
					// 	const { aboveAvgPercent } = graphData[index];
					// 	const isAboveAvg = aboveAvgPercent > 0;
					// 	return `${isAboveAvg ? '+' : ''}${aboveAvgPercent}% ${
					// 		isAboveAvg ? 'above' : 'below'
					// 	} average in the given time-range`;
					// },
				},
			},
			annotation: {
				annotations: {
					avgLine: {
						type: 'line',
						yMin: avgEventCount,
						yMax: avgEventCount,
						borderColor: 'rgb(156, 163, 175)',
						borderWidth: 1,
						label: {
							content: 'Avg',
							position: 'start',
							backgroundColor: 'transparent',
							color: 'black',
							font: {
								size: 12,
							},
						},
					},
				},
			},
			zoom: {
				limits: {
					x: { min: 'original', max: 'original' },
					y: { min: 'original', max: 'original' },
				},
				zoom: {
					wheel: {
						enabled: false,
					},
					pinch: {
						enabled: true,
					},
					mode: 'x',
					drag: {
						enabled: true,
						backgroundColor: 'rgba(99, 102, 241, 0.1)',
					},
					onZoomComplete: ({ chart }) => {
						handleRangeComplete(chart);
					},
				},
			},
		},
		scales: {
			x: {
				type: 'category',
				display: false,
			},
			y: {
				display: hasData,
				ticks: {
					count: 2,
					callback: (value: string | number) => {
						const numericValue = typeof value === 'number' ? value : parseFloat(value);
						return HumanizeNumber(numericValue);
					},
				},
				grid: {
					drawTicks: false,
				},
			},
		},
		elements: {
			line: {
				borderWidth: 1.25,
			},
			point: {
				radius: 2.5,
				hitRadius: 6,
			},
		},
		layout: {
			padding: {
				top: 0,
			},
		},
		hover: {
			mode: 'nearest',
			axis: 'x',
			intersect: false,
		},
		onClick: (_event, elements) => {
			if (elements && elements.length > 0) {
				const index = elements[0].index;
				setTimeRangeFromGraph(graphData[index].minute);
			}
		},
	};

	return (
		<div style={{ height: '100%', width: '100%', cursor: 'pointer' }}>
			<Line data={chartData} options={chartOptions} />
		</div>
	);
};

export default AreaChartComponent;
