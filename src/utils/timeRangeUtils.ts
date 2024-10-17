import dayjs from 'dayjs';
import moment from 'moment-timezone';
import _ from 'lodash';

const defaultTimeRangeOption = {
	value: 'none',
	label: 'Time range not included',
	time_filter: null,
};

const makeTimeRangeOptions = ({
	selected,
	current,
}: {
	selected: { from: string; to: string } | null;
	current: { startTime: Date; endTime: Date };
}) => {
	return [
		defaultTimeRangeOption,
		{
			value: 'current',
			label: `Current - ${makeTimeRangeLabel(current.startTime, current.endTime)}`,
			time_filter: {
				from: current.startTime.toISOString(),
				to: current.endTime.toISOString(),
			},
		},
		...(selected
			? [
					{
						value: 'selected',
						label: `Stored - ${makeTimeRangeLabel(selected.from, selected.to)}`,
						time_filter: {
							from: selected.from,
							to: selected.to,
						},
					},
			  ]
			: []),
	];
};

const formatTime = (date: Date | string): string => {
	return formatDateWithTimezone(date, 'hh:mm A DD MMM YY z');
};

const formatDay = (date: Date | string): string => {
	return formatDateWithTimezone(date, 'DD MMMYY z');
};

const makeTimeRangeLabel = (startTime: Date | string, endTime: Date | string) => {
	const startTimeWithTz = formatDateWithTimezone(startTime, 'hh:mm A DD MMM YY z');
	const endTimeWithTz = formatDateWithTimezone(endTime, 'hh:mm A DD MMM YY z');

	return `${startTimeWithTz} to ${endTimeWithTz}`;
};

// to optimize performace, it has been decided to round off the time at the given level
// so making the end-time inclusive
const optimizeEndTime = (endTime: Date) => {
	return dayjs(endTime).add(1, 'minute').toDate();
};

const getDefaultTimeRangeOption = (
	opts: { value: string; label: string; time_filter: null | { from: string; to: string } }[],
) => {
	const selectedTimeRange = _.find(opts, (option) => option.value === 'selected');
	return selectedTimeRange ? selectedTimeRange : defaultTimeRangeOption;
};

// accepts a date-time string and outputs a human readable string with timezone
// output format 31/12/1990 11:59 pm IST
const formatDateWithTimezone = (dateTime: string | Date, format: string = 'DD/MM/YYYY h:mm a z'): string => {
	const localTimeZone = moment.tz.guess();
	const convertedDate = moment.tz(dateTime, localTimeZone);
	return convertedDate.format(format);
};

const formatDateAsCastType = (date: Date): string => {
	return dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss[Z]');
};

const timeRangeUtils = {
	defaultTimeRangeOption,
	formatDateWithTimezone,
	makeTimeRangeOptions,
	makeTimeRangeLabel,
	optimizeEndTime,
	getDefaultTimeRangeOption,
	formatTime,
	formatDay,
	formatDateAsCastType,
};

export default timeRangeUtils;
