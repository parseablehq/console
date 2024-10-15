import { TickConfig, tickUnits, UnitType } from '@/@types/parseable/api/dashboards';
import { formatBytes, HumanizeNumber } from '@/utils/formatBytes';
import timeRangeUtils from '@/utils/timeRangeUtils';
import _ from 'lodash';

const { formatTime, formatDay } = timeRangeUtils;

export const getRandomUnitTypeForChart = (tick_config: TickConfig[]): UnitType | null => {
	if (_.isEmpty(tick_config)) return null;

	const { unit, key } = _.find(tick_config, (c) => !_.isEmpty(c.key)) || {};
	return unit && _.includes(tickUnits, unit) && !_.isEmpty(key) ? (unit as UnitType) : null;
};

export const getUnitTypeByKey = (axisKey: string, tick_config: TickConfig[]): UnitType | null => {
	if (_.isEmpty(tick_config)) return null;

	const { unit, key } = _.find(tick_config, (c) => c.key === axisKey) || {};
	return unit && _.includes(tickUnits, unit) && !_.isEmpty(key) ? (unit as UnitType) : null;
};

const formatTickValue = (value: any, unit: (typeof tickUnits)[number] | null) => {
	try {
		if (unit === null && _.isNumber(value)) {
			return HumanizeNumber(value);
		} else if (unit === 'bytes' && _.isNumber(value)) {
			return formatBytes(value);
		} else if (unit === 'utc-timestamp') {
			const sanitizedTs = _.includes(value, 'z') || _.includes(value, 'Z') ? value : `${value}Z`;
			const date = new Date(sanitizedTs);
			const isValidDate = !isNaN(date.getTime());

			if (!isValidDate) return value;

			if (date.getHours() === 0) {
				return formatDay(date);
			} else {
				return formatTime(date);
			}
		} else {
			return value;
		}
	} catch (e) {
		console.log(e);
		return value;
	}
};

export const tickFormatter = (value: any, unit: (typeof tickUnits)[number] | null) => {
	return formatTickValue(value, unit);
};
