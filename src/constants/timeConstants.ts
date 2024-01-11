import dayjs from 'dayjs';

type FixedDuration = {
	name: string;
	milliseconds: number;
};

export const REFRESH_INTERVALS: number[] = [10000, 30000, 60000, 300000, 600000, 1200000];
export const FIXED_DURATIONS: FixedDuration[] = [
	{
		name: 'last 10 minutes',
		milliseconds: dayjs.duration({ minutes: 10 }).asMilliseconds(),
	},
	{
		name: 'last 1 hour',
		milliseconds: dayjs.duration({ hours: 1 }).asMilliseconds(),
	},
	{
		name: 'last 5 hours',
		milliseconds: dayjs.duration({ hours: 5 }).asMilliseconds(),
	},
	{
		name: 'last 24 hours',
		milliseconds: dayjs.duration({ days: 1 }).asMilliseconds(),
	},
	{
		name: 'last 3 days',
		milliseconds: dayjs.duration({ days: 3 }).asMilliseconds(),
	},
	{
		name: 'last 7 days',
		milliseconds: dayjs.duration({ days: 7 }).asMilliseconds(),
	},
] as const;
