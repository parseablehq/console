import { Loader, px, Stack, Text, Menu, Button, rem, SegmentedControl, Modal, TextInput, Box } from '@mantine/core';
import classes from './styles/tile.module.css';
import { IconAlertTriangle, IconArrowsLeftRight, IconBraces, IconDotsVertical, IconFileSpreadsheet, IconGripVertical, IconJson, IconMessageCircle, IconPencil, IconPhoto, IconSearch, IconSettings, IconTable, IconTrash } from '@tabler/icons-react';
import charts, { getVizComponent, isCircularChart, isGraph, renderCircularChart, renderGraph, renderJsonView } from './Charts';
import handleCapture, { makeExportClassName } from '@/utils/exportImage';
import { useDashboardsStore } from './providers/DashboardsProvider';
import _ from 'lodash';
import { useTileQuery } from '@/hooks/useDashboards';
import { useCallback, useEffect, useState } from 'react';
import { Tile, TileQueryResponse } from '@/@types/parseable/api/dashboards';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import Table from './Table';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import { makeExportData, useLogsStore } from '../Stream/providers/LogsProvider';

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
		visualization: { visualization_type, circular_chart_config },
	} = tile;
	const name_key = _.get(circular_chart_config, 'name_key', '');
	const value_key = _.get(circular_chart_config, 'value_key', '');
	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderCircularChart({ queryResponse: data, name_key, value_key, chart: visualization_type })}
		</Stack>
	);
};

const Graph = (props: { tile: Tile; data: TileQueryResponse }) => {
	const { tile, data } = props;
	const {
		visualization: { visualization_type, graph_config },
	} = tile;
	const x_key = _.get(graph_config, 'x_key', '');
	const y_key = _.get(graph_config, 'y_key', []);
	return (
		<Stack style={{ flex: 1, width: '100%' }}>
			{renderGraph({ queryResponse: data, x_key, y_key, chart: visualization_type })}
		</Stack>
	);
};

const JsonView = (props: { tile: Tile; data: TileQueryResponse }) => {
	const { tile, data } = props;
	return (
		<Stack style={{ flex: 1, width: '100%', overflowY: 'scroll' }}>{renderJsonView({ queryResponse: data })}</Stack>
	);
};

const getViz = (vizType: string | null) => {
	if (!vizType) return <></>;

	if (vizType === 'table') {
		return Table;
	} else if (isCircularChart(vizType)) {
		return CircularChart;
	} else if (isGraph(vizType)) {
		return Graph;
	} else {
		return <></>;
	}
};

const DeleteDashboardModal = () => {
	const [activeDashboard, setDashbaordsStore] = useDashboardsStore((store) => store.activeDashboard);
	const [deleteDashboardModalOpen] = useDashboardsStore((store) => store.deleteDashboardModalOpen);
	const [confirmText, setConfirmText] = useState<string>('');

	const onChangeHandler = useCallback((e) => {
		setConfirmText(e.target.value);
	}, []);

	const onDelete = useCallback(() => {}, [activeDashboard?.dashboard_id]);

	if (!activeDashboard?.dashboard_id) return null;

	return (
		<Modal
			opened={deleteDashboardModalOpen}
			onClose={() => {}}
			size="auto"
			centered
			styles={{
				body: { padding: '0 1rem 1rem 1rem', width: 400 },
				header: { padding: '1rem', paddingBottom: '0.4rem' },
			}}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Delete Tile</Text>}>
			<Stack>
				<Stack gap={8}>
					<Text className={classes.deleteWarningText}>
						Are you sure want to delete this dashboard and its contents ?
					</Text>
					<TextInput
						value={confirmText}
						onChange={onChangeHandler}
						placeholder={'Type the dashboard name to confirm. ie ' + activeDashboard.name}
					/>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button variant="outline">Cancel</Button>
					</Box>
					<Box>
						<Button disabled={confirmText !== activeDashboard.name}>Delete</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

function TileControls(props: { tile: Tile; data: TileQueryResponse }) {
	const {
		tile: { name, tile_id },
		data = {},
	} = props;
	const { records = [], fields = [] } = data;
	const [allowDrag] = useDashboardsStore((store) => store.allowDrag);

	const exportPng = useCallback(() => {
		handleCapture({ className: makeExportClassName(tile_id), fileName: name });
	}, []);

	const exportCSV = useCallback(() => {
		downloadDataAsCSV(makeExportData(records, fields, 'CSV'), name);
	}, [props.data]);

	const exportJson = useCallback(() => {
		downloadDataAsJson(makeExportData(records, fields, 'JSON'), name);
	}, [props.data]);

	if (allowDrag) return <IconGripVertical className={classes.tileControlIcon} stroke={1} size="1rem" />;

	return (
		<Menu shadow="md" width={240} position="bottom-start">
			<Menu.Target>
				<IconDotsVertical className={classes.tileControlIcon} stroke={1} size="1rem" />
			</Menu.Target>
			<Menu.Dropdown style={{ padding: '0.25rem 0.25rem' }}>
				<Text className={classes.tileCtrlLabel}>Actions</Text>
				<Menu.Item
					className={classes.tileCtrlItem}
					leftSection={<IconPencil className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
					<Text className={classes.tileCtrlItemText}>Edit</Text>
				</Menu.Item>
				<Menu.Item
					className={classes.tileCtrlItem}
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
					onClick={exportJson}
					className={classes.tileCtrlItem}
					leftSection={<IconBraces className={classes.tileCtrlItemIcon} size="1rem" stroke={1.2} />}>
					<Text className={classes.tileCtrlItemText}>JSON</Text>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}

const Tile = (props: { id: string }) => {
	const [tileData, setTileData] = useState<TileQueryResponse>();
	const [showJson, setShowJson] = useState<boolean>(false);
	const [timeRange] = useLogsStore(store => store.timeRange)
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const tile = _.chain(activeDashboard)
		.get('tiles', [])
		.find((tile) => tile.tile_id === props.id)
		.value();

	const onQuerySuccess = useCallback((data: TileQueryResponse) => {
		setTileData(data);
	}, []);

	const { fetchTileData, isLoading } = useTileQuery({ onSuccess: onQuerySuccess });

	useEffect(() => {
		const shouldNotify = false;
		const santizedQuery = sanitiseSqlString(tile.query, shouldNotify, 100);
		fetchTileData({ query: santizedQuery, startTime: timeRange.startTime, endTime: timeRange.endTime });
	}, []);

	const toggleJsonView = useCallback(() => {
		return setShowJson(prev => !prev)
	}, [])
	const hasData = !_.isEmpty(tileData);
	const vizType = _.get(tile, 'visualization.visualization_type', null);
	const Viz = showJson ? JsonView : getViz(vizType);
	return (
		<Stack h="100%" gap={0} className={classes.container}>
			<Stack className={classes.tileHeader} gap={0}>
				<Stack gap={0}>
					<Text className={classes.tileTitle}>
						{tile.name}
					</Text>
					<Text className={classes.tileDescription}>{tile.description}</Text>
				</Stack>
				<TileControls tile={tile} data={tileData}/>
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
