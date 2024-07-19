import { Tile, Visualization } from "@/pages/Dashboards/providers/DashboardsProvider";
import { Log } from "./query";
import { UseFormReturnType } from "@mantine/form";

export type CreateDashboardType = {
    name: string;
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
