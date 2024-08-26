import moment from 'moment-timezone';
import _ from 'lodash';

const getDateTimeWithTZ = (dateTime: string) => {
	if (typeof dateTime !== 'string' && _.isEmpty(dateTime)) return '-';
	const sysTimeZone = moment.tz.guess();
	const convertedDate = moment.tz(dateTime, sysTimeZone);
	return convertedDate.format('DD MMM YYYY HH:mm z');
};

const dateTimeUtils = { getDateTimeWithTZ };

export default dateTimeUtils;
