import type { Log } from '@/@types/parseable/api/query';
import _ from 'lodash';

type Data = Log[] | null;

export const exportJson = (jsonString: string, filename: string) => {
	const blob = new Blob([jsonString], { type: 'application/json' });
	const downloadLink = document.createElement('a');
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = `${filename}.json`;
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
};

export const downloadDataAsJson = (data: Data, filename: string) => {
	if (data === null || data.length === 0) return;

	const jsonString = JSON.stringify(data, null, 2);
	return exportJson(jsonString, filename);
};

export const downloadDataAsCSV = (data: Data, filename: string) => {
	if (data === null || data.length === 0) return;

	const csvString = data
		.map((row) =>
			Object.values(row)
				.map((value) => (value !== null ? `\"${value}\"` : ''))
				.join(','),
		)
		.join('\n');
	const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
	const downloadLink = document.createElement('a');
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = `${filename}.csv`;
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
};

// makes sure no records has missing cells

const _isVulnerableValue = (val: string | number | Date) => {
	if (!_.isString(val)) return false;

	return _.chain(val)
		.head()
		.thru((startChar) => _.includes(['=', '+', '-', '@'], startChar))
		.value();
};

export const sanitizeCSVData = (data: Data, headers: string[]): any[] => {
	if (data) {
		return data.map((d) => {
			return headers.reduce((acc, header) => {
				const cellValue = _.chain(d)
					.get(header, '')
					.thru((val) => (_isVulnerableValue(val) ? `'${val}'` : val))
					.value();
				return { ...acc, [header]: cellValue || '' };
			}, {});
		});
	} else {
		return [];
	}
};
