import { Loader, Stack, Text, Menu } from '@mantine/core';
import classes from './styles/tile.module.css';
import {
	IconAlertTriangle,
	IconBraces,
	IconCopyPlus,
	IconDotsVertical,
	IconGripVertical,
	IconPencil,
	IconPhoto,
	IconShare,
	IconTable,
	IconTrash,
} from '@tabler/icons-react';
import {
	isCircularChart,
	isGraph,
	renderCircularChart,
	renderGraph,
	// renderJsonView,
} from './Charts';
import handleCapture, { makeExportClassName } from '@/utils/exportImage';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import _ from 'lodash';
import { useTileQuery } from '@/hooks/useDashboards';
import { useCallback } from 'react';
import { Tile as TileType, TileQueryResponse } from '@/@types/parseable/api/dashboards';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import Table from './Table';
import { downloadDataAsCSV, downloadDataAsJson, exportJson } from '@/utils/exportHelpers';
import { makeExportData } from '../Stream/providers/LogsProvider';
import { getRandomUnitTypeForChart, getUnitTypeByKey } from './utils';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const ParseableLogo = () => (
	<div className="png-export-parseable-logo" style={{ display: 'none', height: '100%' }}>
		<svg height={20} id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<style>
				{`
        .cls-1 {
			fill: #fc466b;
			}
			.cls-2 {
				fill: #545beb;
				}
				`}
			</style>
			<g>
				<path
					className="cls-2"
					d="M13.92,7.76l-5.93,5.93c-.26,.26-.06,.71,.31,.68,1.57-.12,3.11-.78,4.31-1.99s1.86-2.74,1.99-4.31c.03-.37-.42-.57-.68-.31Z"
				/>
				<path
					className="cls-2"
					d="M13.97,4.61v-.02c-.36-.74-1.33-.92-1.91-.34l-7.58,7.58c-.58,.58-.4,1.55,.34,1.9h.02c.44,.22,.97,.12,1.32-.23l7.57-7.57c.35-.35,.45-.87,.24-1.32Z"
				/>
				<path
					className="cls-2"
					d="M7.54,1.38c.26-.26,.06-.71-.31-.68-1.57,.12-3.11,.78-4.31,1.99S1.05,5.43,.93,7c-.03,.37,.42,.57,.68,.31L7.54,1.38Z"
				/>
			</g>
			<g>
				<path
					className="cls-2"
					d="M2.67,8.27l-.87,.87c-.35,.35-.44,.88-.23,1.33v.02c.36,.73,1.33,.9,1.9,.33l.88-.88c.46-.46,.46-1.21,0-1.68h0c-.46-.46-1.21-.46-1.68,0Z"
				/>
				<path
					className="cls-1"
					d="M7.09,7.2l3.96-3.96c.57-.57,.41-1.54-.33-1.89h-.02c-.45-.22-.98-.13-1.33,.22l-3.96,3.96c-.46,.46-.46,1.21,0,1.68h0c.46,.46,1.21,.46,1.68,0Z"
				/>
			</g>
		</svg>
	</div>
);

const { toggleCreateTileModal, toggleDeleteTileModal, toggleDuplicateTileModal } = dashboardsStoreReducers;

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

const CircularChart = (props: { tile: TileType; data: TileQueryResponse }) => {
	const { tile, data } = props;
	const {
		visualization: { visualization_type, circular_chart_config, tick_config },
	} = tile;
	const name_key = _.get(circular_chart_config, 'name_key', '');
	const value_key = _.get(circular_chart_config, 'value_key', '');
	const unit = getRandomUnitTypeForChart(tick_config);
	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderCircularChart({ queryResponse: data, name_key, value_key, chart: visualization_type, unit })}
		</Stack>
	);
};

const Graph = (props: { tile: TileType; data: TileQueryResponse }) => {
	const { tile, data } = props;
	const {
		visualization: { visualization_type, graph_config, tick_config },
	} = tile;
	const x_key = _.get(graph_config, 'x_key', '');
	const y_keys = _.get(graph_config, 'y_keys', []);
	const xUnit = getUnitTypeByKey(x_key, tick_config);
	const yUnit = getUnitTypeByKey(_.head(y_keys) || '', tick_config);
	const orientation = _.get(graph_config, 'orientation', 'horizontal');
	const graphBasicType = _.get(graph_config, 'graph_type', 'default');
	const color_config = _.get(props.tile.visualization, 'color_config', []);

	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderGraph({
				queryResponse: data,
				x_key,
				y_keys,
				chart: visualization_type,
				yUnit,
				xUnit,
				orientation,
				graphBasicType,
				color_config,
			})}
		</Stack>
	);
};

// const JsonView = (props: { tile: TileType; data: TileQueryResponse }) => {
// 	const { data } = props;
// 	return (
// 		<Stack style={{ flex: 1, width: '100%', overflowY: 'scroll' }}>{renderJsonView({ queryResponse: data })}</Stack>
// 	);
// };

const getViz = (vizType: string | null) => {
	if (!vizType) return null;

	if (vizType === 'table') {
		return Table;
	} else if (isCircularChart(vizType)) {
		return CircularChart;
	} else if (isGraph(vizType)) {
		return Graph;
	} else {
		return null;
	}
};

function TileControls(props: { tile: TileType; data: TileQueryResponse }) {
	const {
		tile: { name, tile_id },
		data,
	} = props;
	const { records = [], fields = [] } = data;
	const [allowDrag] = useDashboardsStore((store) => store.allowDrag);
	const [, setDashboardsStore] = useDashboardsStore(() => null);

	const exportPng = useCallback(() => {
		handleCapture({ className: makeExportClassName(tile_id), fileName: name });
	}, []);

	const exportCSV = useCallback(() => {
		downloadDataAsCSV(makeExportData(records, fields, 'CSV'), name);
	}, [props.data]);

	const exportDataAsJson = useCallback(() => {
		downloadDataAsJson(makeExportData(records, fields, 'JSON'), name);
	}, [props.data]);

	const openEditTile = useCallback(() => {
		setDashboardsStore((store) => toggleCreateTileModal(store, true, tile_id));
	}, []);

	const openDuplicateTileModal = useCallback(() => {
		setDashboardsStore((store) => toggleDuplicateTileModal(store, true, tile_id));
	}, []);

	const openDeleteModal = useCallback(() => {
		setDashboardsStore((store) => toggleDeleteTileModal(store, true, tile_id));
	}, []);

	const exportTileConfig = useCallback(async () => {
		const santizedConfig = _.omit(props.tile, 'tile_id');
		return exportJson(JSON.stringify(santizedConfig, null, 2), name);
	}, [name]);

	if (allowDrag)
		return <IconGripVertical className={classes.tileControlIcon + ' ' + classes.dragIcon} stroke={2} size="1rem" />;

	return (
		<div className="png-export-menu-icon">
			<Menu shadow="md" width={240} position="bottom-start">
				<Menu.Target>
					<IconDotsVertical className={classes.tileControlIcon} stroke={1} size="1rem" />
				</Menu.Target>
				<Menu.Dropdown style={{ padding: '0.25rem 0.25rem' }}>
					<Text className={classes.tileCtrlLabel}>Actions</Text>
					<Menu.Item
						className={classes.tileCtrlItem}
						onClick={openEditTile}
						leftSection={<IconPencil className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
						<Text className={classes.tileCtrlItemText}>Edit</Text>
					</Menu.Item>
					<Menu.Item
						className={classes.tileCtrlItem}
						onClick={openDuplicateTileModal}
						leftSection={<IconCopyPlus className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
						<Text className={classes.tileCtrlItemText}>Duplicate</Text>
					</Menu.Item>
					<Menu.Item
						className={classes.tileCtrlItem}
						onClick={exportTileConfig}
						leftSection={<IconShare className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
						<Text className={classes.tileCtrlItemText}>Share</Text>
					</Menu.Item>
					<Menu.Item
						className={classes.tileCtrlItem}
						onClick={openDeleteModal}
						leftSection={<IconTrash className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
						<Text className={classes.tileCtrlItemText}>Delete</Text>
					</Menu.Item>
					<Menu.Divider />
					<Text className={classes.tileCtrlLabel}>Exports</Text>
					<Menu.Item
						onClick={exportPng}
						className={classes.tileCtrlItem}
						leftSection={<IconPhoto className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
						<Text className={classes.tileCtrlItemText}>PNG</Text>
					</Menu.Item>
					<Menu.Item
						onClick={exportCSV}
						className={classes.tileCtrlItem}
						leftSection={<IconTable className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
						<Text className={classes.tileCtrlItemText}>CSV</Text>
					</Menu.Item>
					<Menu.Item
						onClick={exportDataAsJson}
						className={classes.tileCtrlItem}
						leftSection={<IconBraces className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
						<Text className={classes.tileCtrlItemText}>JSON</Text>
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</div>
	);
}

const Tile = (props: { id: string }) => {
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [tilesData] = useDashboardsStore((store) => store.tilesData);
	const tileData = _.get(tilesData, props.id, { records: [], fields: [] });
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const tile = _.chain(activeDashboard)
		.get('tiles', [])
		.find((tile) => tile.tile_id === props.id)
		.value();

	const shouldNotify = false;
	const santizedQuery = sanitiseSqlString(tile.query, shouldNotify, 100);

	const { isLoading } = useTileQuery({
		tileId: props.id,
		query: santizedQuery,
		startTime: timeRange.startTime,
		endTime: timeRange.endTime,
	});

	// const toggleJsonView = useCallback(() => {
	// 	return setShowJson((prev) => !prev);
	// }, []);
	const hasData = !_.isEmpty(tileData);
	const vizType = _.get(tile, 'visualization.visualization_type', null);
	const tick_config = _.get(tile, 'visualization.tick_config', []);
	const Viz = getViz(vizType);
	const vizTypeExportClassName = `png-export-${vizType || ''}`;

	return (
		<Stack h="100%" gap={0} className={`png-export-tile-container ${classes.container} ${vizTypeExportClassName}`}>
			<Stack className={`png-export-tile-header ${classes.tileHeader}`} gap={0}>
				<Stack gap={0}>
					<Text title={tile.name} lineClamp={1} className={`png-export-tile-title ${classes.tileTitle}`}>
						{tile.name}
					</Text>
					<Text
						title={tile.description}
						className={`png-export-tile-description ${classes.tileDescription}`}
						lineClamp={1}>
						{tile.description}
					</Text>
					<Text className={`png-export-tile-timerange ${classes.tileTimeRangeText}`}>{timeRange.label}</Text>
				</Stack>
				<TileControls tile={tile} data={tileData} />
				<ParseableLogo />
			</Stack>
			{isLoading && <LoadingView />}
			{!hasData && !isLoading && <NoDataView />}
			{!isLoading && hasData && (
				<Stack className={`png-export-viz-container ${classes.tileContainer}`} style={{ flex: 1 }}>
					{Viz && <Viz tile={tile} data={tileData} tick_config={tick_config} />}
				</Stack>
			)}
		</Stack>
	);
};

export default Tile;
