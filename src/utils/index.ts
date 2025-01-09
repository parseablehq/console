import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { logOut } from '@/api/auth';

export const baseURL = import.meta.env.VITE_PARSEABLE_URL ?? '/';

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

	if (value || typeof value === 'boolean' || typeof value === 'number') {
		return value;
	}

	return 'N/A';
};

//getQueryParam
export const useGetQueryParam = () => {
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

export const signOutHandler = async () => {
	const loginPage = `${window.location.origin}/login`;
	const currentPage = window.location.href;
	try {
		await logOut();
		Cookies.remove('session');
		Cookies.remove('username');
		if (currentPage !== loginPage) {
			window.location.href = loginPage;
		}
	} catch (e) {
		Cookies.remove('session');
		Cookies.remove('username');
		console.log(e);
	}
};

export const generateRandomId = (length: number) =>
	Array.from(
		{ length },
		() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)],
	).join('');

export const addOrRemoveElement = (array: any[], element: any) => {
	const dup = array.slice();
	const index = array.indexOf(element);
	if (index === -1) {
		dup.push(element);
		return dup;
	} else {
		dup.splice(index, 1);
		return dup;
	}
};

export const copyTextToClipboard = async (value: any) => {
	try {
		await navigator.clipboard.writeText(_.isString(value) ? value : JSON.stringify(value, null, 2));
	} catch (error) {
		console.warn('Clipboard API failed, falling back to execCommand:', error);
		fallbackCopyToClipboard(value);
	}
};

function fallbackCopyToClipboard(text: string) {
	const textarea = document.createElement('textarea');
	textarea.value = text;
	document.body.appendChild(textarea);
	textarea.select();
	try {
		const successful = document.execCommand('copy');
		if (successful) {
			alert('Copied to clipboard!');
		} else {
			alert('Copy failed. Please copy manually.');
		}
	} catch (err) {
		console.error('Fallback copy failed:', err);
	}
	document.body.removeChild(textarea);
}

export const getOffset = (page: number, rowSize: number) => {
	const product = page * rowSize;
	if (product % 1000 === 0) {
		return Math.floor((product - 1) / 1000) * 1000;
	}

	return Math.floor(product / 1000) * 1000;
};

export const joinOrSplit = (value: string[] | string): string | string[] => {
	const joinOperator = ',';
	if (Array.isArray(value)) {
		return value.join(joinOperator);
	} else {
		return value.split(joinOperator);
	}
};
