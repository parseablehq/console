import { Dashboard, Tile, tileSizeWidthMap } from '@/@types/parseable/api/dashboards';
import initContext from '@/utils/initContext';
import _ from 'lodash';
import { Layout } from 'react-grid-layout';

export const genLayout = (tiles: Tile[]): Layout => {
	return _.reduce(
		tiles,
		(acc, tile) => {
			const {
				visualization: { size },
				tile_id,
			} = tile;
			const tileWidth = _.get(tileSizeWidthMap, size, 4);

			const prevItem = _.last(acc);

			if (_.isEmpty(acc) || !prevItem) {
				return [
					{
						i: tile_id,
						x: 0,
						y: 0,
						w: tileWidth,
						h: 1,
						minH: 1,
					},
				];
			} else {
				const { x: prevX, y: prevY, w: prevItemWidth } = prevItem;
				const possibleX = prevX + prevItemWidth;

				if (possibleX + tileWidth <= 12) {
					return [...acc, { i: tile_id, x: possibleX, y: prevY, w: tileWidth, h: 1, minH: 1 }];
				} else {
					return [
						...acc,
						{
							i: tile_id,
							x: 0,
							y: prevY + 1,
							w: tileWidth,
							h: 1,
							minH: 1,
						},
					];
				}
			}
		},
		[],
	);
};

type DashboardsStore = {
	dashboards: Dashboard[] | null;
	activeDashboard: Dashboard | null;
	createDashboardModalOpen: boolean;
	editDashboardModalOpen: boolean;
	deleteDashboardModalOpen: boolean;
	createTileFormOpen: boolean;
	vizEditorModalOpen: boolean;
	allowDrag: boolean;
};

const mockDashboards = [
	{
		name: 'Backend dashboard',
		description: 'This is a description for the dashboard',
		id: 'dashboard-1',
		tiles: [
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				query: 'SELECT level, COUNT(*) AS level_count FROM teststream GROUP BY level;',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
					circular_chart_config: {
						name_key: 'level',
						value_key: 'level_count',
					},
					size: 'sm',
				},
			},
			{
				name: 'Bar Tile',
				id: 'tile-4',
				description: 'Description for the tile',
				stream: 'backend',
				query:
					"SELECT message, SUM(CASE WHEN level = 'info' THEN 1 ELSE 0 END) AS info, SUM(CASE WHEN level = 'warn' THEN 1 ELSE 0 END) AS warn, SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) AS error FROM teststream GROUP BY message;",
				visualization: {
					type: 'bar-chart' as 'donut-chart',
					graph_config: {
						x_key: 'message',
						y_key: ['info', 'warn', 'error'],
					},
					size: 'lg',
				},
			},
			{
				name: 'Donut Tile',
				id: 'tile-3',
				description: 'Description for the tile',
				stream: 'backend',
				query: 'SELECT level, COUNT(*) AS level_count FROM teststream GROUP BY level;',
				visualization: {
					type: 'pie-chart' as 'donut-chart',
					circular_chart_config: {
						name_key: 'level',
						value_key: 'level_count',
					},
					size: 'sm',
				},
			},
			{
				name: 'Line Tile',
				id: 'tile-2',
				description: 'Description for the tile',
				stream: 'backend',
				query: 'SELECT device_id, host, level, message, app_meta FROM teststream;',
				visualization: {
					type: 'table' as 'line-chart',
					graph_config: {
						x_key: 'level',
						y_key: ['level_count'],
					},
					size: 'lg',
				},
			},
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
				},
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				},
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
				},
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				},
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				},
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				},
			},
			{
				name: 'Donut Tile',
				id: 'tile-1',
				description: 'Description for the tile',
				stream: 'backend',
				visualization: {
					type: 'donut-chart' as 'donut-chart',
				},
			},
		],
	},
];

const initialState: DashboardsStore = {
	dashboards: null,
	activeDashboard: null,
	createDashboardModalOpen: false,
	editDashboardModalOpen: false,
	deleteDashboardModalOpen: false,
	createTileFormOpen: false,
	vizEditorModalOpen: false,
	allowDrag: false,
};

type ReducerOutput = Partial<DashboardsStore>;

type DashboardsStoreReducers = {
	setDashboards: (store: DashboardsStore, dashboards: Dashboard[]) => ReducerOutput;
	toggleCreateDashboardModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	toggleEditDashboardModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	selectDashboard: (store: DashboardsStore, dashboardId: string) => ReducerOutput;
	toggleCreateTileModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	toggleVizEditorModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	toggleAllowDrag: (store: DashboardsStore) => ReducerOutput;
	toggleDeleteDashboardModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
};

const toggleCreateDashboardModal = (_store: DashboardsStore, val: boolean) => {
	return {
		createDashboardModalOpen: val,
	};
};

const toggleEditDashboardModal = (_store: DashboardsStore, val: boolean) => {
	return {
		editDashboardModalOpen: val,
	};
};

const toggleCreateTileModal = (_store: DashboardsStore, val: boolean) => {
	return {
		createTileFormOpen: val,
	};
};

const toggleVizEditorModal = (_store: DashboardsStore, val: boolean) => {
	return {
		vizEditorModalOpen: val,
	};
};


const toggleDeleteDashboardModal = (_store: DashboardsStore, val: boolean) => {
	return {
		deleteDashboardModalOpen: val,
	};
};


const toggleAllowDrag = (store: DashboardsStore) => {
	return {
		allowDrag: !store.allowDrag
	};
};

const setDashboards = (store: DashboardsStore, dashboards: Dashboard[]) => {
	const { activeDashboard: activeDashboardFromStore } = store;
	const defaultActiveDashboard = _.isArray(dashboards) && !_.isEmpty(dashboards) ? dashboards[0] : null;
	const activeDashboard = (() => {
		if (activeDashboardFromStore) {
			const id = activeDashboardFromStore.dashboard_id;
			const dashboard = _.find(dashboards, (dashboard) => dashboard.dashboard_id === id);
			return dashboard || defaultActiveDashboard;
		} else {
			return defaultActiveDashboard;
		}
	})();
	return {
		dashboards,
		activeDashboard: {...activeDashboard, tiles: [{
			"name": "asas",
			"tile_id": "juiii",
			"description": "asasa",
			"stream": "teststream",
			"query": "select * from teststream LIMIT 10",
			"order": null,
			"visualization": {
				"visualization_type": "donut-chart",
				"circular_chart_config": {
					"name_key": "app_meta",
					"value_key": "device_id"
				},
				"graph_config": null,
				"size": "sm",
				"color_config": []
			}
		}]},
	};
};

const selectDashboard = (store: DashboardsStore, dashboardId: string) => {
	const activeDashboard = _.find(store.dashboards, (dashboard) => dashboard.dashboard_id === dashboardId);
	return {
		...initialState,
		dashboards: store.dashboards,
		activeDashboard: activeDashboard || null,
	};
};

const { Provider: DashbaordsProvider, useStore: useDashboardsStore } = initContext(initialState);

const dashboardsStoreReducers: DashboardsStoreReducers = {
	setDashboards,
	toggleCreateDashboardModal,
	selectDashboard,
	toggleCreateTileModal,
	toggleVizEditorModal,
	toggleEditDashboardModal,
	toggleAllowDrag,
	toggleDeleteDashboardModal
};

export { DashbaordsProvider, useDashboardsStore, dashboardsStoreReducers };
