import dayjs from 'dayjs';

export const wait = (sec = 1) => new Promise<void>((res) => setTimeout(res, sec * 1000));

export const randNum = (min = 1, max = 5) => Math.floor(Math.random() * (max - min + 1)) + min;

type ScrollToOptions = {
	y?: number;
	x?: number;
	behavior?: 'auto' | 'smooth';
};

export const scrollTo = (opts?: ScrollToOptions) => {
	const { y = 0, x = 0, behavior = 'auto' } = opts || {};
	window.scrollTo({ top: y, left: x, behavior });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseLogData = (value?: any) => {
	if (typeof value === 'string' && dayjs(value).isValid()) {
		return dayjs(value).utc(true).format('DD/MM/YYYY HH:mm:ss');
	}

	if (value) {
		return value;
	}

	return 'N/A';
};
