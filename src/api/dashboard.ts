import { Dashboard } from "@/pages/Dashboards/providers/DashboardsProvider";
import { Axios } from "./axios";
import { CREATE_DASHBOARDS_URL, LIST_DASHBOARDS, LOG_QUERY_URL } from "./constants";
import timeRangeUtils from "@/utils/timeRangeUtils";
import _ from "lodash";
import { CreateDashboardType, TileQuery, TileQueryResponse } from "@/@types/parseable/api/dashboards";

const {optimizeEndTime} = timeRangeUtils;

export const getDashboards = (userId: string) => {
	return Axios().get<Dashboard[]>(LIST_DASHBOARDS(userId));
};

// export const putDashboard = (filterId: string, filter: SavedFilterType) => {
// 	return Axios().put(UPDATE_SAVED_FILTERS_URL(filterId), filter);
// };

export const postDashboard = (dashboard: CreateDashboardType) => {
	return Axios().post(CREATE_DASHBOARDS_URL, dashboard);
};

// export const deleteDashboard = (filterId: string) => {
// 	return Axios().delete(DELETE_SAVED_FILTERS_URL(filterId));
// };

// using just for the dashboard tile now
// refactor once the fields are included in the /query in the response
export const getQueryData = (opts?: TileQuery) => {
	if (_.isEmpty(opts)) throw 'Invalid Arguments'

    const includeFields = true;
	const { query, startTime, endTime } = opts;
	return Axios().post<TileQueryResponse>(
		LOG_QUERY_URL(includeFields),
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
}
