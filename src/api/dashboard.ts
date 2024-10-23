import { Axios } from './axios';
import {
	CREATE_DASHBOARDS_URL,
	DELETE_DASHBOARDS_URL,
	LIST_DASHBOARDS,
	LOG_QUERY_URL,
	UPDATE_DASHBOARDS_URL,
} from './constants';
import timeRangeUtils from '@/utils/timeRangeUtils';
import _ from 'lodash';
import {
	CreateDashboardType,
	Dashboard,
	ImportDashboardType,
	TileQuery,
	TileQueryResponse,
	UpdateDashboardType,
} from '@/@types/parseable/api/dashboards';

const { optimizeEndTime } = timeRangeUtils;

export const getDashboards = () => {
	return Axios().get<Dashboard[]>(LIST_DASHBOARDS);
};

export const putDashboard = (dashboardId: string, dashboard: UpdateDashboardType) => {
	return Axios().put(UPDATE_DASHBOARDS_URL(dashboardId), dashboard);
};

export const postDashboard = (dashboard: CreateDashboardType | ImportDashboardType) => {
	return Axios().post(CREATE_DASHBOARDS_URL, { ...dashboard });
};

export const removeDashboard = (dashboardId: string) => {
	return Axios().delete(DELETE_DASHBOARDS_URL(dashboardId));
};

// using just for the dashboard tile now
// refactor once the fields are included in the /query in the response
export const getQueryData = (opts?: TileQuery, signal?: AbortSignal) => {
	if (_.isEmpty(opts)) throw 'Invalid Arguments';

	const { query, startTime, endTime } = opts;
	return Axios().post<TileQueryResponse>(
		LOG_QUERY_URL({ fields: true }),
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{ signal },
	);
};
