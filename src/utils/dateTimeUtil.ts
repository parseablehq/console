import moment from 'moment-timezone';
import _ from 'lodash';

//accepts a date-time string and outputs a human readable string with timezone
const getDateTimeWithTZ = (dateTime: string | undefined) => {
	if (!dateTime && typeof dateTime !== 'string' && _.isEmpty(dateTime)) return;

	const sysTimeZone = moment.tz.guess();
	const convertedDate = moment.tz(dateTime, sysTimeZone);
	return convertedDate.format('DD MMM YYYY HH:mm z');
};

const dateTimeUtils = { getDateTimeWithTZ };

export default dateTimeUtils;
