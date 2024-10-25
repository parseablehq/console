import { useLogsStore, logsStoreReducers } from '../Stream/providers/LogsProvider';
import { useCallback } from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useDashboardsStore } from './providers/DashboardsProvider';
import { Dashboard } from '@/@types/parseable/api/dashboards';
import { syncStoretoURL, simplifyDate } from '@/url-sync/syncStore';
import { FIXED_DURATIONS } from '@/constants/timeConstants';

const { setTimeRange } = logsStoreReducers;

type FixedDurations = (typeof FIXED_DURATIONS)[number];

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

	const updateURL = useCallback(
		(id: string) => {
			if (timeRange.type === 'custom') {
				const startTime = simplifyDate(timeRange.startTime).toString();
				const endTime = simplifyDate(timeRange.endTime).toString();
				syncStoretoURL({ id, from: startTime, to: endTime });
			}
			if (timeRange.type === 'fixed') {
				const interval: FixedDurations | undefined = FIXED_DURATIONS.find(
					(duration) => duration.milliseconds === timeRange.interval,
				);
				if (interval) syncStoretoURL({ id, interval: interval?.label });
			}
		},
		[timeRange],
	);
	const updateURLandDateTime = useCallback(
		(id: string, from: string, to: string) => {
			syncStoretoURL({ id, from, to });
		},
		[timeRange],
	);
	return { updateURL, updateURLandDateTime };
};
