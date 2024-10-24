import { useLogsStore, logsStoreReducers } from '../Stream/providers/LogsProvider';
import { useCallback } from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useDashboardsStore } from './providers/DashboardsProvider';
import { Dashboard } from '@/@types/parseable/api/dashboards';
import { syncStoretoURL, simplifyDate } from '@/url-sync/syncStore';

const { setTimeRange } = logsStoreReducers;

export const useSyncTimeRange = () => {
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	const [, setLogsStore] = useLogsStore((_store) => null);

	const updateTimeRange = useCallback(
		(dashboard: Dashboard) => {
			if (!dashboard) return;

			const { time_filter } = dashboard;
			const hasTimeFilter = !_.isEmpty(time_filter);
			hasTimeFilter &&
				setLogsStore((store) =>
					setTimeRange(store, { startTime: dayjs(time_filter.from), endTime: dayjs(time_filter.to), type: 'custom' }),
				);
		},
		[dashboards],
	);

	return { updateTimeRange };
};

export const syncDashboardStoretoURL = () => {
	const [timeRange] = useLogsStore((store) => store.timeRange);

	const from = simplifyDate(timeRange.startTime).toString();
	const to = simplifyDate(timeRange.endTime).toString();

	const updateURL = useCallback(
		(id: string) => {
			syncStoretoURL({ id, from, to });
		},
		[timeRange],
	);
	return { updateURL };
};
