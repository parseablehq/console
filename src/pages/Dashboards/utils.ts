import { TickConfig, tickUnits, UnitType } from '@/@types/parseable/api/dashboards';
import { formatBytes, HumanizeNumber } from '@/utils/formatBytes';
import _ from 'lodash';

export const getRandomUnitTypeForChart = (tick_config: TickConfig[]): UnitType | null => {
	if (_.isEmpty(tick_config)) return null;

	const { unit } = _.head(tick_config) || {};
	return unit && _.includes(tickUnits, unit) ? (unit as UnitType) : null;
};

const formatTickValue = (value: any, unit: (typeof tickUnits)[number] | null) => {
	if (!_.isNumber(value)) return value;

	if (unit === null) {
		return HumanizeNumber(value);
	} else if (unit === 'bytes') {
		return formatBytes(value);
	} else {
		return value;
	}
};

export const tickFormatter = (value: any, unit: (typeof tickUnits)[number] | null) => {
	return formatTickValue(value, unit);
};
