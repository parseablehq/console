import { useEffect, useState } from 'react';
import { useDashboardsStore, dashboardsStoreReducers } from '../providers/DashboardsProvider';
import { TimeRange, useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import dayjs from 'dayjs';
import timeRangeUtils from '@/utils/timeRangeUtils';
import moment from 'moment-timezone';

const { getRelativeStartAndEndDate } = timeRangeUtils;
const { selectDashboard } = dashboardsStoreReducers;
const { setTimeRange } = logsStoreReducers;
const timeRangeFormat = 'DD-MMM-YYYY_HH-mm';
const keys = ['id', 'interval', 'from', 'to'];

const dateToParamString = (date: Date) => {
	return dayjs(date).format(timeRangeFormat);
};

const dateParamStrToDateObj = (str: string) => {
	const date = moment(str, timeRangeFormat).toDate();
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

const storeToParamsObj = (opts: { dashboardId: string; timeRange: TimeRange }): Record<string, string> => {
	const { dashboardId, timeRange } = opts;
	const params: Record<string, string> = {
		id: dashboardId,
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
	const [isStoreSyncd, setStoreSyncd] = useState(false);
	const [activeDashboard, setDashboardsStore] = useDashboardsStore((store) => store.activeDashboard);
	const [timeRange, setLogsStore] = useLogsStore((store) => store.timeRange);
	const [searchParams, setSearchParams] = useSearchParams();
	const dashboardId = activeDashboard?.dashboard_id || '';

	useEffect(() => {
		setStoreSyncd(true);
	}, []);

	useEffect(() => {
		if (isStoreSyncd) {
			const storeAsParams = storeToParamsObj({ dashboardId, timeRange });
			const presentParams = paramsStringToParamsObj(searchParams);
			if (_.isEqual(storeAsParams, presentParams)) return;

			setSearchParams(storeAsParams);
		}
	}, [dashboardId, timeRange.startTime.toISOString(), timeRange.endTime.toISOString()]);

	useEffect(() => {
		const storeAsParams = storeToParamsObj({ dashboardId, timeRange });
		const presentParams = paramsStringToParamsObj(searchParams);
		if (_.isEqual(storeAsParams, presentParams)) return;

		if (storeAsParams.id !== presentParams.id) {
			setDashboardsStore((store) => selectDashboard(store, presentParams.id));
		}

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
	}, [searchParams]);

	return { isStoreSyncd };
};

export default useParamsController;
