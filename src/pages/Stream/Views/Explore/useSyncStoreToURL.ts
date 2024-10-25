import { useLogsStore } from '../../providers/LogsProvider';
import { syncStoretoURL } from '@/url-sync/syncStore';
import { useCallback } from 'react';
import { simplifyDate } from '@/url-sync/syncStore';
import { FIXED_DURATIONS } from '@/constants/timeConstants';

type FixedDurations = (typeof FIXED_DURATIONS)[number];

// type URLState = {
// 	view: string;
// 	offset: string;
// 	page: String;
// 	rows: String;
// };

export const syncStoreToURL = () => {
	const [timeRange] = useLogsStore((store) => store.timeRange);
	const [tableOpts] = useLogsStore((store) => store.tableOpts);
	const [viewMode] = useLogsStore((store) => store.viewMode);
	const { perPage, currentOffset, currentPage } = tableOpts;
	const { type, interval, startTime, endTime } = timeRange;

	const updateURL = useCallback(() => {
		if (type === 'custom') {
			syncStoretoURL({
				view: viewMode,
				offset: currentOffset,
				page: currentPage,
				rows: perPage,
				from: simplifyDate(startTime),
				to: simplifyDate(endTime),
			});
		}
		if (type === 'fixed') {
			const intervalFrom: FixedDurations | undefined = FIXED_DURATIONS.find(
				(duration) => duration.milliseconds === interval,
			);
			if (intervalFrom)
				syncStoretoURL({
					view: viewMode,
					offset: currentOffset,
					page: currentPage,
					rows: perPage,
					interval: intervalFrom?.label,
				});
		}
	}, [viewMode, perPage, currentOffset, type, interval, startTime, endTime, currentPage]);

	// const updateStore = (state: Partial<URLState>) => {};

	return {
		updateURL,
		//  updateStore
	};
};
