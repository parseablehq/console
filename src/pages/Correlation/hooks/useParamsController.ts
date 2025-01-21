import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import dayjs from 'dayjs';
import timeRangeUtils from '@/utils/timeRangeUtils';
import moment from 'moment-timezone';
import { appStoreReducers, TimeRange, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { getOffset } from '@/utils';
import { LOG_QUERY_LIMITS } from '@/pages/Stream/providers/LogsProvider';

const { getRelativeStartAndEndDate, formatDateWithTimezone, getLocalTimezone } = timeRangeUtils;
const { setCorrelationId, setTargetPage, setCurrentOffset, setPerPage } = correlationStoreReducers;
const { setTimeRange } = appStoreReducers;
const timeRangeFormat = 'DD-MMM-YYYY_HH-mmz';
const keys = ['id', 'interval', 'from', 'to', 'page', 'rows'];

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
	correlationId: string;
	timeRange: TimeRange;
	rows: string;
	page: string;
}): Record<string, string> => {
	const { correlationId, timeRange, page, rows } = opts;
	const params: Record<string, string> = {
		id: correlationId,
		rows,
		page,
		...deriveTimeRangeParams(timeRange),
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
	const [{ correlationId }, setCorrelationStore] = useCorrelationStore((store) => store);
	const [tableOpts] = useCorrelationStore((store) => store.tableOpts);
	const [timeRange, setAppStore] = useAppStore((store) => store.timeRange);
	const [searchParams, setSearchParams] = useSearchParams();

	const { currentOffset, currentPage, targetPage, perPage } = tableOpts;

	const pageOffset = Math.ceil(currentOffset / perPage);

	useEffect(() => {
		const storeAsParams = storeToParamsObj({
			correlationId,
			timeRange,
			rows: `${perPage}`,
			page: `${targetPage ? targetPage : Math.ceil(currentPage + pageOffset)}`,
		});
		const presentParams = paramsStringToParamsObj(searchParams);
		if (storeAsParams.id !== presentParams.id) {
			setCorrelationStore((store) => setCorrelationId(store, presentParams.id));
		}
		if (storeAsParams.rows !== presentParams.rows && LOG_QUERY_LIMITS.includes(_.toNumber(presentParams.rows))) {
			setCorrelationStore((store) => setPerPage(store, _.toNumber(presentParams.rows)));
		}
		if (storeAsParams.page !== presentParams.page && !_.isEmpty(presentParams.page)) {
			setCorrelationStore((store) => setTargetPage(store, _.toNumber(presentParams.page)));
			const offset = getOffset(_.toNumber(presentParams.page), _.toNumber(presentParams.rows));

			if (offset > 0) {
				setCorrelationStore((store) => setCurrentOffset(store, offset));

				setCorrelationStore((store) =>
					setTargetPage(
						store,
						Math.abs(_.toNumber(presentParams.page) - Math.ceil(offset / _.toNumber(presentParams.rows))),
					),
				);
			}
		}
		syncTimeRangeToStore(storeAsParams, presentParams);
		setStoreSynced(true);
	}, []);

	useEffect(() => {
		if (isStoreSynced) {
			const storeAsParams = storeToParamsObj({
				correlationId,
				timeRange,
				rows: `${perPage}`,
				page: `${targetPage ? targetPage : Math.ceil(currentPage + pageOffset)}`,
			});
			const presentParams = paramsStringToParamsObj(searchParams);
			if (_.isEqual(storeAsParams, presentParams)) return;

			setSearchParams(storeAsParams);
		}
	}, [
		correlationId,
		isStoreSynced,
		timeRange.startTime.toISOString(),
		timeRange.endTime.toISOString(),
		targetPage,
		tableOpts,
	]);

	useEffect(() => {
		if (!isStoreSynced) return;

		const storeAsParams = storeToParamsObj({
			correlationId,
			timeRange,
			rows: `${perPage}`,
			page: `${targetPage ? targetPage : Math.ceil(currentPage + pageOffset)}`,
		});
		const presentParams = paramsStringToParamsObj(searchParams);
		if (_.isEqual(storeAsParams, presentParams)) return;

		if (storeAsParams.id !== presentParams.id) {
			setCorrelationStore((store) => setCorrelationId(store, presentParams.id));
		}
		if (storeAsParams.rows !== presentParams.rows && LOG_QUERY_LIMITS.includes(_.toNumber(presentParams.rows))) {
			setCorrelationStore((store) => setPerPage(store, _.toNumber(presentParams.rows)));
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
					return setAppStore((store) => setTimeRange(store, { startTime, endTime, type: 'fixed' }));
				}
			} else if (_.has(presentParams, 'from') && _.has(presentParams, 'to')) {
				if (storeAsParams.from !== presentParams.from && storeAsParams.to !== presentParams.to) {
					const startTime = dateParamStrToDateObj(presentParams.from);
					const endTime = dateParamStrToDateObj(presentParams.to);
					if (_.isDate(startTime) && _.isDate(endTime)) {
						return setAppStore((store) =>
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
