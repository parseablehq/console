import { useCallback, useEffect, useState } from 'react';
import { TimeRange, useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import { LOG_QUERY_LIMITS, columnsToSkip } from '@/pages/Stream/providers/LogsProvider';
import dayjs from 'dayjs';
import timeRangeUtils from '@/utils/timeRangeUtils';
import moment from 'moment-timezone';
import { filterStoreReducers, QueryType, useFilterStore } from '../providers/FilterProvider';
import { generateQueryBuilderASTFromSQL } from '../utils';
import { getOffset, joinOrSplit } from '@/utils';

const { getRelativeStartAndEndDate, formatDateWithTimezone, getLocalTimezone } = timeRangeUtils;
const {
	setTimeRange,
	onToggleView,
	setPerPage,
	setCustQuerySearchState,
	setTargetPage,
	setCurrentOffset,
	setTargetColumns,
} = logsStoreReducers;
const { toogleQueryParamsFlag, setAppliedFilterQuery, applySavedFilters, updateAppliedQuery } = filterStoreReducers;
const timeRangeFormat = 'DD-MMM-YYYY_HH-mmz';
const keys = ['view', 'rows', 'page', 'interval', 'from', 'to', 'query', 'filterType', 'fields'];

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
	page: string;
	rows: string;
	query: string;
	filterType: string;
	fields: string;
}): Record<string, string> => {
	const { timeRange, page, view, rows, query, filterType, fields } = opts;

	const params: Record<string, string> = {
		...deriveTimeRangeParams(timeRange),
		view,
		rows,
		page,
		query,
		filterType: query ? filterType : '',
		fields,
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
	const [, setFilterStore] = useFilterStore((store) => store);

	const { currentOffset, currentPage, targetPage, perPage, headers, disabledColumns, targetColumns } = tableOpts;

	const visibleHeaders = headers.filter((el) => !columnsToSkip.includes(el));

	const activeHeaders = visibleHeaders.filter((el) => !disabledColumns.includes(el));
	const [searchParams, setSearchParams] = useSearchParams();
	const pageOffset = Math.ceil(currentOffset / perPage);

	useEffect(() => {
		const storeAsParams = storeToParamsObj({
			timeRange,
			page: `${targetPage ? targetPage : Math.ceil(currentPage + pageOffset)}`,
			view: viewMode,
			rows: `${perPage}`,
			query: custQuerySearchState.custSearchQuery,
			filterType: custQuerySearchState.viewMode,
			fields: `${joinOrSplit(!_.isEmpty(targetColumns) ? targetColumns : activeHeaders)}`,
		});
		const presentParams = paramsStringToParamsObj(searchParams);
		syncTimeRangeToStore(storeAsParams, presentParams);
		if (['table', 'json'].includes(presentParams.view) && presentParams.view !== storeAsParams.view) {
			setLogsStore((store) => onToggleView(store, presentParams.view as 'table' | 'json'));
		}
		if (storeAsParams.rows !== presentParams.rows && LOG_QUERY_LIMITS.includes(_.toNumber(presentParams.rows))) {
			setLogsStore((store) => setPerPage(store, _.toNumber(presentParams.rows)));
		}

		if (storeAsParams.query !== presentParams.query) {
			setLogsStore((store) => setCustQuerySearchState(store, presentParams.query, presentParams.filterType));

			if (presentParams.filterType === 'filters') {
				setFilterStore((store) =>
					updateAppliedQuery(store, generateQueryBuilderASTFromSQL(presentParams.query) as QueryType),
				);
				setFilterStore((store) =>
					// applySavedFilters(store, generateQueryBuilderASTFromSQL(presentParams.query) as QueryType),
					setAppliedFilterQuery(store, presentParams.query),
				);
				setFilterStore((store) => toogleQueryParamsFlag(store, true));
			}
		}

		if (storeAsParams.fields !== presentParams.fields) {
			setLogsStore((store) => setTargetColumns(store, joinOrSplit(presentParams.fields) as string[]));
		}

		if (storeAsParams.page !== presentParams.page && !_.isEmpty(presentParams.page)) {
			setLogsStore((store) => setTargetPage(store, _.toNumber(presentParams.page)));

			const offset = getOffset(_.toNumber(presentParams.page), _.toNumber(presentParams.rows));

			if (offset > 0) {
				setLogsStore((store) => setCurrentOffset(store, offset));

				setLogsStore((store) =>
					setTargetPage(
						store,
						Math.abs(_.toNumber(presentParams.page) - Math.ceil(offset / _.toNumber(presentParams.rows))),
					),
				);
			}
		}

		setStoreSynced(true);
	}, []);

	useEffect(() => {
		if (isStoreSynced) {
			const storeAsParams = storeToParamsObj({
				timeRange,
				page: `${targetPage ? targetPage : Math.ceil(currentPage + pageOffset)}`,
				view: viewMode,
				rows: `${perPage}`,
				query: custQuerySearchState.custSearchQuery,
				filterType: custQuerySearchState.viewMode,
				fields: `${joinOrSplit(!_.isEmpty(targetColumns) ? targetColumns : activeHeaders)}`,
			});

			const presentParams = paramsStringToParamsObj(searchParams);
			if (_.isEqual(storeAsParams, presentParams)) return;
			setSearchParams(storeAsParams);
		}
	}, [
		tableOpts,
		targetPage,
		viewMode,
		timeRange.startTime.toISOString(),
		timeRange.endTime.toISOString(),
		custQuerySearchState,
	]);

	useEffect(() => {
		if (!isStoreSynced) return;

		const storeAsParams = storeToParamsObj({
			timeRange,
			page: `${targetPage ? targetPage : Math.ceil(currentPage + pageOffset)}`,
			view: viewMode,
			rows: `${perPage}`,
			query: custQuerySearchState.custSearchQuery,
			filterType: custQuerySearchState.viewMode,
			fields: `${joinOrSplit(!_.isEmpty(targetColumns) ? targetColumns : activeHeaders)}`,
		});
		const presentParams = paramsStringToParamsObj(searchParams);

		if (_.isEqual(storeAsParams, presentParams)) return;

		//set the params to the store
		if (presentParams.view && presentParams.view !== storeAsParams.view) {
			setLogsStore((store) => onToggleView(store, presentParams.view as 'table' | 'json'));
		}
		if (storeAsParams.rows !== presentParams.rows && LOG_QUERY_LIMITS.includes(_.toNumber(presentParams.rows))) {
			setLogsStore((store) => setPerPage(store, _.toNumber(presentParams.rows)));
		}

		if (storeAsParams.query !== presentParams.query && !_.isEmpty(presentParams.query)) {
			if (presentParams.filterType === 'filters')
				setFilterStore((store) =>
					applySavedFilters(store, generateQueryBuilderASTFromSQL(presentParams.query) as QueryType),
				);
			setLogsStore((store) => setCustQuerySearchState(store, presentParams.query, presentParams.filterType));
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
