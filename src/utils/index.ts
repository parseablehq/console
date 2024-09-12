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

export const signOutHandler = async () => {
	try {
		await logOut();
		Cookies.remove('session');
		Cookies.remove('username');
		window.location.href = `${window.location.origin}/login`;
	} catch (e) {
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
