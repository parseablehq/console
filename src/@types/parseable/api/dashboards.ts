import { Tile, Visualization } from "@/pages/Dashboards/providers/DashboardsProvider";
import { UseFormReturnType } from "@mantine/form";

export type CreateDashboardType = {
    name: string;
	description: string;
	refresh_interval: number;
	tiles: Tile[];
	time_filter: null | {
		from: string;
		to: string;
	}
}


export type UpdateDashboardType = {
    name: string;
	description: string;
	refresh_interval: number;
	tiles: Tile[];
	dashboard_id: string;
	time_filter: null | {
		from: string;
		to: string;
	}
}

export type TileQuery = {query: string, startTime: Date, endTime: Date}

export type TileRecord = {
	[key: string | number]: number | string;
}

export type TileData = TileRecord[];

export type TileQueryResponse = {
    fields: string[];
    records: TileData
}

export interface FormOpts extends Omit<Tile, 'id' | 'visualization'> {
	isQueryValidated: boolean;
	data: TileQueryResponse | null;
	visualization: Visualization;
}

export type TileFormType = UseFormReturnType<FormOpts, (values: FormOpts) => FormOpts>;
