import { useCallback, useEffect, useState } from 'react';
import { TimeRange, useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import dayjs from 'dayjs';
import timeRangeUtils from '@/utils/timeRangeUtils';
import moment from 'moment-timezone';

const { getRelativeStartAndEndDate, formatDateWithTimezone, getLocalTimezone } = timeRangeUtils;
const {
	setTimeRange,
	onToggleView,
	setPerPage,
	setCustQuerySearchState,
	// setCurrentOffset,
	// setPageAndPageData,
	// setDisabledColumns,
} = logsStoreReducers;
const timeRangeFormat = 'DD-MMM-YYYY_HH-mmz';
const keys = [
	'view',
	'rows',
	'interval',
	'from',
	'to',
	'query',
	// 'fields', 'offset', 'page'
];
const FIXED_ROWS = ['50', '100', '150', '200'];

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
	query: string;
}): Record<string, string> => {
	const { timeRange, offset, page, view, rows, query } = opts;
	const params: Record<string, string> = {
		...deriveTimeRangeParams(timeRange),
		view,
		offset,
		rows,
		page,
		fields: 'datetime,host',
		query,
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
	const [custQuerySearchState] = useLogsStore((store) => store.custQuerySearchState);
	const [timeRange, setLogsStore] = useLogsStore((store) => store.timeRange);

	const { currentOffset, currentPage, perPage, headers, disabledColumns } = tableOpts;

	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		const storeAsParams = storeToParamsObj({
			timeRange,
			offset: `${currentOffset}`,
			page: `${currentPage}`,
			view: viewMode,
			rows: `${perPage}`,
			query: custQuerySearchState.custSearchQuery,
		});
		const presentParams = paramsStringToParamsObj(searchParams);
		if (presentParams.view && presentParams.view !== storeAsParams.view) {
			setLogsStore((store) => onToggleView(store, presentParams.view as 'table' | 'json'));
		}
		if (storeAsParams.rows !== presentParams.rows && FIXED_ROWS.includes(presentParams.rows)) {
			setLogsStore((store) => setPerPage(store, _.toNumber(presentParams.rows)));
		}

		// if (storeAsParams.fields !== presentParams.fields) {
		// 	console.log(headers);
		// 	setLogsStore((store) => setDisabledColumns(store, _.difference(headers, presentParams.fields.split(','))));
		// }

		// if (presentParams.offset !== storeAsParams.offset) {
		// 	setLogsStore((store) => setCurrentOffset(store, _.toNumber(presentParams.offset)));
		// }
		// if (presentParams.page && storeAsParams.page !== presentParams.page) {
		// 	setLogsStore((store) => setPageAndPageData(store, _.toNumber(presentParams.page)));
		// }

		if (storeAsParams.query !== presentParams.query) {
			setLogsStore((store) => setCustQuerySearchState(store, presentParams.query));
		}
		syncTimeRangeToStore(storeAsParams, presentParams);
		setStoreSynced(true);
	}, []);

	useEffect(() => {
		if (isStoreSynced && currentPage !== 0) {
			const storeAsParams = storeToParamsObj({
				timeRange,
				offset: `${currentOffset}`,
				page: `${currentPage}`,
				view: viewMode,
				rows: `${perPage}`,
				query: custQuerySearchState.custSearchQuery,
			});
			const presentParams = paramsStringToParamsObj(searchParams);
			if (_.isEqual(storeAsParams, presentParams)) return;
			setSearchParams(storeAsParams);
		}
	}, [
		tableOpts,
		viewMode,
		timeRange.startTime.toISOString(),
		timeRange.endTime.toISOString(),
		custQuerySearchState,
		disabledColumns,
	]);

	useEffect(() => {
		if (!isStoreSynced || currentPage === 0) return;

		const storeAsParams = storeToParamsObj({
			timeRange,
			offset: `${currentOffset}`,
			page: `${currentPage}`,
			view: viewMode,
			rows: `${perPage}`,
			query: custQuerySearchState.custSearchQuery,
		});
		const presentParams = paramsStringToParamsObj(searchParams);

		if (_.isEqual(storeAsParams, presentParams)) return;

		//set the params to the store
		if (presentParams.view && presentParams.view !== storeAsParams.view) {
			setLogsStore((store) => onToggleView(store, presentParams.view as 'table' | 'json'));
		}
		if (storeAsParams.rows !== presentParams.rows && FIXED_ROWS.includes(presentParams.rows)) {
			setLogsStore((store) => setPerPage(store, _.toNumber(presentParams.rows)));
		}

		// if (presentParams.fields) {
		// 	console.log(_.difference(headers, presentParams.fields.split(',')));
		// 	setLogsStore((store) => setDisabledColumns(store, _.difference(headers, presentParams.fields.split(','))));
		// }
		// if (storeAsParams.page !== presentParams.page) {
		// 	setLogsStore((store) => setPageAndPageData(store, _.toNumber(presentParams.page)));
		// }
		if (storeAsParams.query !== presentParams.query) {
			setLogsStore((store) => setCustQuerySearchState(store, presentParams.query));
		}
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
