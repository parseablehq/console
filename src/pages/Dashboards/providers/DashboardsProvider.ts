import initContext from '@/utils/initContext';
import { AxiosResponse } from 'axios';
import _ from 'lodash';

export const visualizations = ['pie-chart', 'donut-chart', 'line-chart', 'bar-chart', 'table',] as const;
export const circularChartTypes = ['pie-chart', 'donurt-chart']
export const tileSizes = ['sm', 'md', 'lg', 'xl'];
export type VizType = typeof visualizations[number];
export type TileSize = typeof tileSizes[number];

export type Visualization = {
	type: VizType;
	size: TileSize;
	colors:
		| {}
		| {
				[key: string | number]: string;
		  };
	circularChartConfig: {} | {nameKey: string, valueKey: string};
	graphConfig: {} | {};
	tableConfig: {} | {};
};

export type Tile = {
	name: string;
	id: string;
	description: string;
	stream: string;
	visualization: Visualization;
	query: string;
};

export type Dashboard = {
	name: string;
	description: string;
	tiles: Tile[];
	// pinned: boolean;
	id: string;
};

type DashboardsStore = {
	dashboards: Dashboard[] | null;
	activeDashboard: Dashboard | null;
	createDashboardModalOpen: boolean;
	createTileModalOpen: boolean;
	vizEditorModalOpen: boolean;
};

const mockDashboards = [
	{
		name: 'Backend dashboard',
		description: 'This is a description for the dashboard',
		id: 'dashboard-1',
		pinned: true,
		tiles: [
			// {
			// 	name: 'Donut Tile',
			// 	id: 'tile-1',
			// 	description: 'Description for the tile',
			// 	stream: 'backend',
			// 	visualization: {
			// 		type: 'donut-chart' as 'donut-chart',
			// 	}
			// },
			// {
			// 	name: 'Donut Tile',
			// 	id: 'tile-2',
			// 	description: 'Description for the tile',
			// 	stream: 'backend',
			// 	visualization: {
			// 		type: 'donut-chart' as 'donut-chart',
			// 	}
			// },
			// {
			// 	name: 'Donut Tile',
			// 	id: 'tile-3',
			// 	description: 'Description for the tile',
			// 	stream: 'backend',
			// 	visualization: {
			// 		type: 'donut-chart' as 'donut-chart',
			// 	}
			// },
		],
	},
	{
		name: 'Frontend Dashboard',
		description: 'This is a description for the dashboard',
		id: 'dashboard-2',
		pinned: true,
		tiles: [
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				}
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				}
			},
		],
	},
	{
		name: 'Api Dashboard',
		description: 'This is a description for the dashboard',
		id: 'dashboard-3',
		pinned: true,
		tiles: [
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				}
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				}
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				}
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				}
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				}
			},
		],
	},
];

const initialState: DashboardsStore = {
	// dashboards: [],
	// activeDashboard: null,
	dashboards: null,
	activeDashboard: null,
	createDashboardModalOpen: false,
	createTileModalOpen: false,
	vizEditorModalOpen: false
};

type ReducerOutput = Partial<DashboardsStore>;

type DashboardsStoreReducers = {
	setDashboards: (store: DashboardsStore, dashboards: Dashboard[]) => ReducerOutput;
	toggleCreateDashboardModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	selectDashboard: (store: DashboardsStore, dashboardId: string) => ReducerOutput;
	toggleCreateTileModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	toggleVizEditorModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
};

const toggleCreateDashboardModal = (_store: DashboardsStore, val: boolean) => {
	return {
		createDashboardModalOpen: val
	}
}

const toggleCreateTileModal = (_store: DashboardsStore, val: boolean) => {
	return {
		createTileModalOpen: val
	}
}

const toggleVizEditorModal = (_store: DashboardsStore, val: boolean) => {
	return {
		vizEditorModalOpen: val
	}
}

const setDashboards = (_store: DashboardsStore, dashboards: Dashboard[]) => {
	return {
		// debug
		dashboards: mockDashboards,
		// debug
		activeDashboard: mockDashboards[0]
	}
};

const selectDashboard = (store: DashboardsStore, dashboardId: string) => {
	const activeDashboard = _.find(store.dashboards, (dashboard) => dashboard.id === dashboardId);
	return {
		activeDashboard: activeDashboard || null,
	};
};

const { Provider: DashbaordsProvider, useStore: useDashboardsStore } = initContext(initialState);

const dashboardsStoreReducers: DashboardsStoreReducers = {
	setDashboards,
	toggleCreateDashboardModal,
	selectDashboard,
	toggleCreateTileModal,
	toggleVizEditorModal
};

export { DashbaordsProvider, useDashboardsStore, dashboardsStoreReducers };
