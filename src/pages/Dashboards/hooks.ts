import { useLogsStore, logsStoreReducers } from '../Stream/providers/LogsProvider';
import { useCallback } from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useDashboardsStore } from './providers/DashboardsProvider';
import { Dashboard } from '@/@types/parseable/api/dashboards';

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
