import { DashboardsStore } from '@/pages/Dashboards/providers/DashboardsProvider';
import { LogsStore, TimeRange } from '@/pages/Stream/providers/LogsProvider';
import dayjs from 'dayjs';
import _ from 'lodash';

const makeURLWithParams = (params: Record<string, string>) => {
	const url = new URL(window.location.href);
	Object.keys(params).forEach((key) => {
		url.searchParams.set(key, params[key]);
	});
	return url.toString();
};

const dateToParamString = (date: Date) => {
    return dayjs(date).format('DD-MMM-YYYY_HH:mm');
}

const deriveTimerangeParams = (timerange: TimeRange) => {
    const {startTime, endTime, interval, type} = timerange;
    console.log(dateToParamString(startTime))
}

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

    syncLogsStore = (store: LogsStore) => {
        const {timeRange} = store;
        deriveTimerangeParams(timeRange)
	};

	deriveDashboardParams = (store: DashboardsStore) => {
		const { activeDashboard } = store;
		const dashboardId = _.get(activeDashboard, 'dashboard_id', '');
		this.dashboardParams = { ...this.dashboardParams, id: dashboardId}
        this.syncDashboardStore();
	};

    syncDashboardStore = () => {
        const {id, from, to} = this.dashboardParams;
        if (_.some([id, from, to], (param) => _.isEmpty(param))) return;

        const url = makeURLWithParams(this.dashboardParams);
		this.push(url);
    }
}

const queryParamSync = QueryParamSync.getInstance();
export default queryParamSync;
