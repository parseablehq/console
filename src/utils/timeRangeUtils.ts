import dayjs from 'dayjs';
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

const makeTimeRangeLabel = (startTime: Date | string, endTime: Date | string) => {
	return `${dayjs(startTime).format('hh:mm A DD MMM YY')} to ${dayjs(endTime).format('hh:mm A DD MMM YY')}`;
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

const timeRangeUtils = {
	defaultTimeRangeOption,

	makeTimeRangeOptions,
	makeTimeRangeLabel,
	optimizeEndTime,
	getDefaultTimeRangeOption,
};

export default timeRangeUtils;
