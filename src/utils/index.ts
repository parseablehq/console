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
		try {
			const obj = JSON.parse(decoded);
			return obj;
		} catch (e) {
			return {};
		}
	}, [location]);
};

// generateQueryParam
export const generateQueryParam = (obj: object) => {
	const stringObj = JSON.stringify(obj);
	const base64 = btoa(stringObj);
	const endcodedBase64 = base64.replaceAll('+', '.').replaceAll('/', '_').replaceAll('=', '-');
	return `?q=${endcodedBase64}`;
};


export function HumanizeNumber(val: number) {
	// Thousands, millions, billions etc..
	let s = ['', ' K', ' M', ' B', ' T'];

	// Dividing the value by 3.
	let sNum = Math.floor(('' + val).length / 3);

	// Calculating the precised value.
	let sVal = parseFloat((sNum != 0 ? val / Math.pow(1000, sNum) : val).toPrecision(4));

	if (sVal % 1 != 0) {
		return sVal.toFixed(1) + s[sNum];
	}

	// Appending the letter to precised val.
	return sVal + s[sNum];
}

export function formatBytes(a: any, b = 1) {
	if (!+a) return '0 Bytes';
	const c = b < 0 ? 0 : b,
		d = Math.floor(Math.log(a) / Math.log(1024));
	return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
		['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
	}`;
}