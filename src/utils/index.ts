import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

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
export const parseLogData = (value?: any, columnName?: string) => {
	const dateColumnNames = ['date', 'datetime', 'time', 'timestamp', 'p_timestamp'];

	if (columnName && dateColumnNames.includes(columnName) && dayjs(value).isValid()) {
		if (columnName === 'p_timestamp') {
			const parsedDate = new Date(dayjs(value).format('YYYY-MM-DD HH:mm +00:00'));
			return dayjs(parsedDate).utc(true).format('DD/MM/YYYY HH:mm:ss');
		}
		return dayjs(value).utc(true).format('DD/MM/YYYY HH:mm:ss');
	}

	if (value) {
		return value;
	}

	return 'N/A';
};

//getQueryParam
export const getQueryParam = () => {
	const location = useLocation();
	return useMemo(() => {
		const searchParams = new URLSearchParams(location.search);
		const query = searchParams.get('q');
		if (!query) return {};
		const base64 = query.replaceAll('.', '+').replaceAll('_', '/').replaceAll('-', '=');
		const decoded = atob(base64);
		return JSON.parse(decoded);
	}, [location]);
};

// generateQueryParam
export const generateQueryParam = (obj: object) => {
	const stringObj = JSON.stringify(obj);
	const base64 = btoa(stringObj);
	const endcodedBase64 = base64.replaceAll('+', '.').replaceAll('/', '_').replaceAll('=', '-');
	return `?q=${endcodedBase64}`;
};
