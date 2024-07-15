import initContext from '@/utils/initContext';

export const visualizations = ['pie-chart', 'donut-chart', 'line-chart', 'bar-chart', 'table',] as const;

export type VizType = typeof visualizations[number];

export type Visualization = {
    type: VizType;
	colors: {} | {
		[key: string | number]: string;
	}
}

export type Tile = {
	name: string;
	id: string;
	description: string;
	stream: string;
	visualization: Visualization;
};

export type Dashboard = {
	name: string;
	description: string;
	tiles: Tile[];
	pinned: boolean;
	id: string;
};

type DashboardsStore = {
	dashboards: Dashboard[];
	activeDashboard: Dashboard | null;
};

const mockDashboards = [
	{
		name: 'Backend dashboard',
		description: 'This is a description for the dashboard',
		id: 'dashboard-1',
		pinned: true,
		tiles: [
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend'
			},
			{
				name: 'Donut Tile',
				id: 'tile-2',
				description: 'Description for the tile',
				stream: 'backend'
			},
			{
				name: 'Donut Tile',
				id: 'tile-3',
				description: 'Description for the tile',
				stream: 'backend'
			},
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
				stream: 'backend'
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend'
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
				stream: 'backend'
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend'
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend'
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend'
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend'
			},
		],
	},
];

const initialState: DashboardsStore = {
	// dashboards: [],
	// activeDashboard: null,
	dashboards: mockDashboards,
	activeDashboard: mockDashboards[0],
};

type ReducerOutput = Partial<DashboardsStore>;

type DashboardsStoreReducers = {};

const { Provider: DashbaordsProvider, useStore: useDashboardsStore } = initContext(initialState);

const dashboardsStoreReducers: DashboardsStoreReducers = {};

export { DashbaordsProvider, useDashboardsStore, dashboardsStoreReducers };
