import { useCallback, useEffect, useState } from 'react';
import { TimeRange, useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import dayjs from 'dayjs';
import timeRangeUtils from '@/utils/timeRangeUtils';
import moment from 'moment-timezone';
// import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const { getRelativeStartAndEndDate, formatDateWithTimezone, getLocalTimezone } = timeRangeUtils;
const { setTimeRange, onToggleView, setPerPage } = logsStoreReducers;
const timeRangeFormat = 'DD-MMM-YYYY_HH-mmz';
const keys = ['view', 'rows', 'offset', 'page', 'interval', 'from', 'to'];

const dateToParamString = (date: Date) => {
	return formatDateWithTimezone(date, timeRangeFormat);
};

const dateParamStrToDateObj = (str: string) => {
	const timeZoneMatch = str.match(/[A-Za-z]+$/);
	const timeZone = timeZoneMatch ? timeZoneMatch[0] : '';
	const localTimeZone = getLocalTimezone();
	const date = (() => {
		if (localTimeZone === timeZone) {
			return moment(str, timeRangeFormat).toDate();
		} else {
			return moment.tz(str, timeRangeFormat, timeZone).toDate();
		}
	})();
	return isNaN(new Date(date).getTime()) ? '' : date;
};

const deriveTimeRangeParams = (timerange: TimeRange): { interval: string } | { from: string; to: string } => {
	const { startTime, endTime, type, interval } = timerange;

	if (type === 'fixed') {
		const selectedDuration = _.find(FIXED_DURATIONS, (d) => d.milliseconds === interval);
		const defaultDuration = FIXED_DURATIONS[0];
		const paramValue = selectedDuration ? selectedDuration.paramValue : defaultDuration.paramValue;
		return { interval: paramValue };
	} else {
		return {
			from: isNaN(new Date(startTime).getTime()) ? '' : dateToParamString(startTime),
			to: isNaN(new Date(endTime).getTime()) ? '' : dateToParamString(endTime),
		};
	}
};

const storeToParamsObj = (opts: {
	timeRange: TimeRange;
	view: string;
	offset: string;
	page: string;
	rows: string;
}): Record<string, string> => {
	const { timeRange, offset, page, view, rows } = opts;
	const params: Record<string, string> = {
		...deriveTimeRangeParams(timeRange),
		view,
		offset,
		rows,
		page,
	};
	return _.pickBy(params, (val, key) => !_.isEmpty(val) && _.includes(keys, key));
};

const paramsStringToParamsObj = (searchParams: URLSearchParams): Record<string, string> => {
	return _.reduce(
		keys,
		(acc: Record<string, string>, key) => {
			const value = searchParams.get(key) || '';
			return _.isEmpty(value) ? acc : { ...acc, [key]: value };
		},
		{},
	);
};

const useParamsController = () => {
	const [isStoreSynced, setStoreSynced] = useState(false);
	const [tableOpts] = useLogsStore((store) => store.tableOpts);
	const [viewMode] = useLogsStore((store) => store.viewMode);
	const { currentOffset, currentPage, perPage } = tableOpts;
	// const [currentStream] = useAppStore((store) => store.currentStream);
	const [timeRange, setLogsStore] = useLogsStore((store) => store.timeRange);
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		const storeAsParams = storeToParamsObj({
			timeRange,
			offset: `${currentOffset}`,
			page: `${currentPage}`,
			view: viewMode,
			rows: `${perPage}`,
		});
		const presentParams = paramsStringToParamsObj(searchParams);
		if (storeAsParams.view !== presentParams.view) {
			setLogsStore((store) => onToggleView(store, presentParams.view as 'json' | 'table'));
		}
		if (storeAsParams.rows !== presentParams.rows && ['50', '100', '150', '200'].includes(presentParams.rows)) {
			setLogsStore((store) => setPerPage(store, _.toNumber(presentParams.rows)));
		}
		syncTimeRangeToStore(storeAsParams, presentParams);
		setStoreSynced(true);
	}, []);

	useEffect(() => {
		if (isStoreSynced) {
			const storeAsParams = storeToParamsObj({
				timeRange,
				offset: `${currentOffset}`,
				page: `${currentPage}`,
				view: viewMode,
				rows: `${perPage}`,
			});
			const presentParams = paramsStringToParamsObj(searchParams);
			if (_.isEqual(storeAsParams, presentParams)) return;

			setSearchParams(storeAsParams);
		}
	}, [tableOpts, viewMode]);

	useEffect(() => {
		if (!isStoreSynced) return;

		const storeAsParams = storeToParamsObj({
			timeRange,
			offset: `${currentOffset}`,
			page: `${currentPage}`,
			view: viewMode,
			rows: `${perPage}`,
		});
		const presentParams = paramsStringToParamsObj(searchParams);

		if (_.isEqual(storeAsParams, presentParams)) return;

		//set the params to the store

		syncTimeRangeToStore(storeAsParams, presentParams);
	}, [searchParams]);

	const syncTimeRangeToStore = useCallback(
		(storeAsParams: Record<string, string>, presentParams: Record<string, string>) => {
			if (_.has(presentParams, 'interval')) {
				if (storeAsParams.interval !== presentParams.interval) {
					const duration = _.find(FIXED_DURATIONS, (d) => d.paramValue === presentParams.interval);
					if (!duration) return;

					const { startTime, endTime } = getRelativeStartAndEndDate(duration);
					return setLogsStore((store) => setTimeRange(store, { startTime, endTime, type: 'fixed' }));
				}
			} else if (_.has(presentParams, 'from') && _.has(presentParams, 'to')) {
				if (storeAsParams.from !== presentParams.from && storeAsParams.to !== presentParams.to) {
					const startTime = dateParamStrToDateObj(presentParams.from);
					const endTime = dateParamStrToDateObj(presentParams.to);
					if (_.isDate(startTime) && _.isDate(endTime)) {
						return setLogsStore((store) =>
							setTimeRange(store, { startTime: dayjs(startTime), endTime: dayjs(endTime), type: 'custom' }),
						);
					}
				}
			}
		},
		[],
	);

	return { isStoreSynced };
};

export default useParamsController;
