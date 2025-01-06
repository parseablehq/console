import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import dayjs from 'dayjs';
import timeRangeUtils from '@/utils/timeRangeUtils';
import moment from 'moment-timezone';
import { appStoreReducers, TimeRange, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';

const { getRelativeStartAndEndDate, formatDateWithTimezone, getLocalTimezone } = timeRangeUtils;
const { setCorrelationId } = correlationStoreReducers;
const { setTimeRange } = appStoreReducers;
const { getCleanStoreForRefetch } = logsStoreReducers;
const timeRangeFormat = 'DD-MMM-YYYY_HH-mmz';
const keys = ['id', 'interval', 'from', 'to'];

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

const storeToParamsObj = (opts: { correlationId: string; timeRange: TimeRange }): Record<string, string> => {
	const { correlationId, timeRange } = opts;
	const params: Record<string, string> = {
		id: correlationId,
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
	const [timeRange, setAppStore] = useAppStore((store) => store.timeRange);
	const [, setLogStore] = useLogsStore(() => null);
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		const storeAsParams = storeToParamsObj({ correlationId, timeRange });
		const presentParams = paramsStringToParamsObj(searchParams);
		syncTimeRangeToStore(storeAsParams, presentParams);
		setStoreSynced(true);
	}, []);

	useEffect(() => {
		if (isStoreSynced) {
			const storeAsParams = storeToParamsObj({ correlationId, timeRange });
			const presentParams = paramsStringToParamsObj(searchParams);
			if (_.isEqual(storeAsParams, presentParams)) return;

			setSearchParams(storeAsParams);
		}
	}, [correlationId, isStoreSynced, timeRange.startTime.toISOString(), timeRange.endTime.toISOString()]);

	useEffect(() => {
		if (!isStoreSynced) return;

		const storeAsParams = storeToParamsObj({ correlationId, timeRange });
		const presentParams = paramsStringToParamsObj(searchParams);
		if (_.isEqual(storeAsParams, presentParams)) return;

		if (storeAsParams.id !== presentParams.id) {
			setCorrelationStore((store) => setCorrelationId(store, presentParams.id));
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
					setLogStore((store) => getCleanStoreForRefetch(store));
					return setAppStore((store) => setTimeRange(store, { startTime, endTime, type: 'fixed' }));
				}
			} else if (_.has(presentParams, 'from') && _.has(presentParams, 'to')) {
				if (storeAsParams.from !== presentParams.from && storeAsParams.to !== presentParams.to) {
					const startTime = dateParamStrToDateObj(presentParams.from);
					const endTime = dateParamStrToDateObj(presentParams.to);
					if (_.isDate(startTime) && _.isDate(endTime)) {
						setLogStore((store) => getCleanStoreForRefetch(store));
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
