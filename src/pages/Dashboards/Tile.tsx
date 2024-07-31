import { Loader, px, Stack, Text } from '@mantine/core';
import classes from './styles/tile.module.css';
import { IconAlertTriangle, IconDotsVertical } from '@tabler/icons-react';
import charts, { getVizComponent, isCircularChart, renderCircularChart, renderGraph } from './Charts';
import handleCapture from '@/utils/exportImage';
import { Tile, useDashboardsStore } from './providers/DashboardsProvider';
import _ from 'lodash';
import { useTileQuery } from '@/hooks/useDashboards';
import { useCallback, useEffect, useState } from 'react';
import { TileQueryResponse } from '@/@types/parseable/api/dashboards';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import Table from './Table';

const NoDataView = () => {
	return (
		<Stack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap={4}>
			<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>No data to display</Text>
		</Stack>
	);
};

const LoadingView = () => {
	return (
		<Stack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap={4}>
			<Loader />
		</Stack>
	);
};

const CircularChart = (props: { tile: Tile; data: TileQueryResponse }) => {
	const { tile, data } = props;
	const {
		visualization: { type, circularChartConfig },
	} = tile;
	const { nameKey = '', valueKey = '' } = circularChartConfig;
	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderCircularChart({ queryResponse: data, nameKey, valueKey, chart: type })}
		</Stack>
	);
};

const Graph = (props: { tile: Tile; data: TileQueryResponse }) => {
	const { tile, data } = props;
	const {
		visualization: { type, graphConfig },
	} = tile;
	const { xKey, yKeys } = graphConfig;
	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderGraph({ queryResponse: data, xKey, yKeys, chart: type })}
		</Stack>
	);
};

const Tile = (props: { id: string }) => {
	const [tileData, setTileData] = useState<TileQueryResponse>();
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const tile = _.chain(activeDashboard)
		.get('tiles', [])
		.find((tile) => tile.id === props.id)
		.value();

	const onQuerySuccess = useCallback((data: TileQueryResponse) => {
		setTileData(data);
	}, []);

	const { fetchTileData, isLoading } = useTileQuery({ onSuccess: onQuerySuccess });

	useEffect(() => {
		const now = new Date();
		// debug // should notify
		const santizedQuery = sanitiseSqlString(tile.query, false, 100);
		fetchTileData({ query: santizedQuery, startTime: new Date(now.getTime() - 24 * 3 * 60 * 60 * 1000), endTime: now });
	}, []);

	const hasData = !_.isEmpty(tileData);
	const Viz = tile.visualization.type === 'table' ? Table : isCircularChart(tile.visualization.type) ? CircularChart : Graph;
	return (
		<Stack h="100%" gap={0} className={classes.container}>
			<Stack className={classes.tileHeader} gap={0}>
				<Stack gap={0}>
					<Text onClick={handleCapture} className={classes.tileTitle}>
						{tile.name}
					</Text>
					<Text className={classes.tileDescription}>{tile.description}</Text>
				</Stack>
				<IconDotsVertical size={px('1rem')} stroke={1.5} />
			</Stack>
			{isLoading && <LoadingView />}
			{!hasData && !isLoading && <NoDataView />}
			{!isLoading && hasData && (
				<Stack className={classes.tileContainer} style={{ flex: 1 }}>
					<Viz tile={tile} data={tileData} />
				</Stack>
			)}
		</Stack>
	);
};

export default Tile;
