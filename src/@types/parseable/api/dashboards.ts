import { UseFormReturnType } from '@mantine/form';
import { Log } from './query';

export type VizType = (typeof visualizations)[number];
export type TileSize = (typeof tileSizes)[number];
export type UnitType = (typeof tickUnits)[number] | null;

// viz type constants
export const visualizations = ['pie-chart', 'donut-chart', 'line-chart', 'bar-chart', 'area-chart', 'table'] as const;
export const circularChartTypes = ['pie-chart', 'donut-chart'] as const;
export const tickUnits = ['bytes', 'utc-timestamp'] as const;
export const graphTypes = ['line-chart', 'bar-chart', 'area-chart'] as const;

// vize size constants
export const tileSizeWidthMap = { sm: 4, md: 6, lg: 8, xl: 12 };
export const tileSizes = ['sm', 'md', 'lg', 'xl'];

export type ColorConfig = {
	field_name: string;
	color_palette: string;
};

export type TickConfig = {
	key: string;
	unit: string;
};

export type Visualization = {
	visualization_type: VizType;
	size: TileSize;
	circular_chart_config?: null | { name_key: string; value_key: string } | {};
	graph_config?: null | { x_key: string; y_keys: string[] } | {};
	color_config: ColorConfig[];
	tick_config: TickConfig[];
};

export type Dashboard = {
	name: string;
	description: string;
	refresh_interval: number;
	tiles: Tile[];
	dashboard_id: string;
	time_filter: null | {
		from: string;
		to: string;
	};
};

export type CreateDashboardType = Omit<Dashboard, 'dashboard_id'>;

export type UpdateDashboardType = Omit<Dashboard, 'tiles'> & {
	tiles: EditTileType[];
};

export type ImportDashboardType = Omit<Dashboard, 'tiles' | 'dashboard_id'> & {
	tiles: EditTileType[];
};

export type TileQuery = { query: string; startTime: Date; endTime: Date };

export type TileData = Log[];

export type TileQueryResponse = {
	fields: string[];
	records: TileData;
};

export interface FormOpts extends Omit<Tile, 'tile_id'> {
	isQueryValidated: boolean;
	data: TileQueryResponse;
	dashboardId: string | null;
	tile_id?: string;
}

export type TileFormType = UseFormReturnType<FormOpts, (values: FormOpts) => FormOpts>;

export type Tile = {
	name: string;
	description: string;
	visualization: Visualization;
	query: string;
	tile_id: string;
	order: number;
};

export type EditTileType = Omit<Tile, 'tile_id'> & {
	tile_id?: string;
};
