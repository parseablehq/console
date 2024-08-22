import { Dashboard, Tile, TileQueryResponse, tileSizeWidthMap } from '@/@types/parseable/api/dashboards';
import initContext from '@/utils/initContext';
import _ from 'lodash';
import { Layout } from 'react-grid-layout';

export const sortTilesByOrder = (tiles: Tile[], idsByOrder: string[]): Tile[] => {
	return _.chain(idsByOrder)
		.map((tile_id, index) => {
			const tile = _.find(tiles, (tile) => tile.tile_id === tile_id);
			return !tile ? null : { ...tile, order: index + 1 };
		})
		.compact()
		.value();
};

export const assignOrderToTiles = (tiles: Tile[]) => {
	return _.map(tiles, (tile, index) => {
		return { ...tile, order: index + 1 };
	});
};

export const genLayout = (tiles: Tile[]): Layout[] => {
	return _.reduce(
		tiles,
		(acc: Layout[], tile) => {
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
	editTileId: string | null;
	tilesData: {
		[key: string]: TileQueryResponse;
	};
	layout: Layout[];
	deleteTileModalOpen: boolean;
	deleteTileId: string | null;
};

const initialState: DashboardsStore = {
	dashboards: null,
	activeDashboard: null,
	createDashboardModalOpen: false,
	editDashboardModalOpen: false,
	deleteDashboardModalOpen: false,
	createTileFormOpen: false,
	vizEditorModalOpen: false,
	allowDrag: false,
	editTileId: null,
	tilesData: {},
	layout: [],
	deleteTileModalOpen: false,
	deleteTileId: null,
};

type ReducerOutput = Partial<DashboardsStore>;

type DashboardsStoreReducers = {
	setDashboards: (store: DashboardsStore, dashboards: Dashboard[]) => ReducerOutput;
	toggleCreateDashboardModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	toggleEditDashboardModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	selectDashboard: (store: DashboardsStore, dashboardId?: string | null, dashboard?: Dashboard) => ReducerOutput;
	toggleCreateTileModal: (store: DashboardsStore, val: boolean, tileId?: string | null) => ReducerOutput;
	toggleVizEditorModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	toggleAllowDrag: (store: DashboardsStore) => ReducerOutput;
	toggleDeleteDashboardModal: (store: DashboardsStore, val: boolean) => ReducerOutput;
	setTileData: (store: DashboardsStore, tileId: string, data: TileQueryResponse) => ReducerOutput;
	toggleDeleteTileModal: (store: DashboardsStore, val: boolean, tileId: string | null) => ReducerOutput;
	resetTilesData: (store: DashboardsStore) => ReducerOutput;
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

const toggleCreateTileModal = (_store: DashboardsStore, val: boolean, tileId: string | null = null) => {
	return {
		createTileFormOpen: val,
		editTileId: tileId,
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
		allowDrag: !store.allowDrag,
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
		activeDashboard,
		layout: activeDashboard ? genLayout(activeDashboard.tiles) : [],
	};
};

const selectDashboard = (store: DashboardsStore, dashboardId?: string | null, dashboard?: Dashboard) => {
	const activeDashboard =
		dashboard && _.isObject(dashboard) && !_.isEmpty(dashboard.dashboard_id)
			? dashboard
			: _.find(store.dashboards, (dashboard) => dashboard.dashboard_id === dashboardId);
	if (!activeDashboard) return {};

	return {
		...initialState,
		dashboards: store.dashboards,
		activeDashboard: activeDashboard || null,
		layout: activeDashboard ? genLayout(activeDashboard.tiles) : [],
	};
};

const setTileData = (store: DashboardsStore, tileId: string, data: TileQueryResponse) => {
	return {
		tilesData: {
			...store.tilesData,
			[tileId]: data,
		},
	};
};

const toggleDeleteTileModal = (_store: DashboardsStore, val: boolean, tileId: string | null) => {
	return {
		deleteTileModalOpen: val,
		deleteTileId: tileId,
	};
};

const resetTilesData = (_store: DashboardsStore) => {
	return {
		tilesData: {},
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
	toggleDeleteDashboardModal,
	setTileData,
	toggleDeleteTileModal,
	resetTilesData,
};

export { DashbaordsProvider, useDashboardsStore, dashboardsStoreReducers };
