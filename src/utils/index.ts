import { Field } from '@/@types/parseable/dataType';
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

export const whereFields = (fields: Field[], search: string): string => {
	if (!search) {
		return '';
	}

	const whereFields = [];

	/*
	 Skipping fields with given matches cause backend/datafusion is not escaping 
		those characters.
	 */

	const skipFieldsContaining = /("|'|\?|<|>|=)/g;

	for (const field of fields) {
		const fieldName = JSON.stringify(field.name);

		if (skipFieldsContaining.test(field.name)) {
			continue;
		}

		switch (field.data_type) {
			case 'Utf8':
			case 'LargeUtf8': {
				whereFields.push(`${fieldName} ILIKE '%${search}%'`);
				continue;
			}
			case 'Int8':
			case 'Int16':
			case 'Int32':
			case 'Int64': {
				whereFields.push(`CAST("${field.name}" AS TEXT) ILIKE '%${search}%'`);
				continue;
			}
		}
	}

	if (whereFields.length) {
		return `WHERE (${whereFields.join(' OR ')})`;
	}

	return '';
};
