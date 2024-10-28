import { DashboardsStore } from '@/pages/Dashboards/providers/DashboardsProvider';
import { LogsStore, TimeRange } from '@/pages/Stream/providers/LogsProvider';
import dayjs from 'dayjs';
import _ from 'lodash';
import { PATHS } from '@/constants/routes';
import getCurrentRoute from './getCurrentRoute';

const makeURLWithParams = (params: Record<string, string>) => {
	const url = new URL(window.location.href);
	Object.keys(params).forEach((key) => {
		url.searchParams.set(key, params[key]);
	});
	return url.toString();
};

const dateToParamString = (date: Date) => {
	return dayjs(date).format('DD-MMM-YYYY_HH-mm');
};

const deriveTimeRangeParams = (timerange: TimeRange) => {
	const { startTime, endTime } = timerange;
	return {
		from: dateToParamString(startTime),
		to: dateToParamString(endTime),
	};
};

class QueryParamSync {
	private static instance: QueryParamSync;
	dashboardParams: Record<string, any>;

	private constructor() {
		this.dashboardParams = {};
	}

	static getInstance(): QueryParamSync {
		if (!QueryParamSync.instance) {
			QueryParamSync.instance = new QueryParamSync();
		}
		return QueryParamSync.instance;
	}

	push = (url: string) => {
		window.history.pushState({}, '', url);
	};

	onDashboards = () => {
		return getCurrentRoute() === PATHS['dashboards'];
	};

	syncLogsStore = (store: LogsStore) => {
		const { timeRange } = store;

		if (this.onDashboards()) {
			const timeRangeParams = deriveTimeRangeParams(timeRange);
			this.dashboardParams = { ...this.dashboardParams, ...timeRangeParams };
			return this.syncDashboardStore();
		}
	};

	deriveDashboardParams = (store: DashboardsStore) => {
		const { activeDashboard } = store;
		const dashboardId = _.get(activeDashboard, 'dashboard_id', '');
		this.dashboardParams = { ...this.dashboardParams, id: dashboardId };
		this.syncDashboardStore();
	};

	syncDashboardStore = () => {
		const { id, from, to } = this.dashboardParams;
		const isValidTimeRange = !_.isEmpty(from) && !_.isEmpty(to);
		if (_.isEmpty(id) || !isValidTimeRange) return;

		const url = makeURLWithParams(this.dashboardParams);
		this.push(url);
	};
}

const queryParamSync = QueryParamSync.getInstance();
export default queryParamSync;
