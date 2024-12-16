import { useCallback } from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useDashboardsStore } from './providers/DashboardsProvider';
import { Dashboard } from '@/@types/parseable/api/dashboards';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { logsStoreReducers, useLogsStore } from '../Stream/providers/LogsProvider';

const { setTimeRange } = appStoreReducers;
const { getCleanStoreForRefetch } = logsStoreReducers;

export const useSyncTimeRange = () => {
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	const [, setLogStore] = useLogsStore((_store) => null);
	const [, setAppStore] = useAppStore((_store) => null);

	const updateTimeRange = useCallback(
		(dashboard: Dashboard) => {
			if (!dashboard) return;

			const { time_filter } = dashboard;
			const hasTimeFilter = !_.isEmpty(time_filter);

			if (hasTimeFilter) {
				setLogStore((store) => getCleanStoreForRefetch(store));
				setAppStore((store) =>
					setTimeRange(store, { startTime: dayjs(time_filter.from), endTime: dayjs(time_filter.to), type: 'custom' }),
				);
			}
		},
		[dashboards],
	);

	return { updateTimeRange };
};
