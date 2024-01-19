import type { Log } from '@/@types/parseable/api/query';

type Data = Log[] | null;

export const downloadDataAsJson = (data: Data, filename: string) => {
	if (data === null || data.length === 0) return;

	const jsonString = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json' });
	const downloadLink = document.createElement('a');
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = `${filename}.json`;
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
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
export const sanitizeCSVData = (data: Data, headers: string[]): any[] => {
	if (data) {
		return data.map((d) => {
			return headers.reduce((acc, header) => {
				return { ...acc, [header]: d[header] || '' };
			}, {});
		});
	} else {
		return [];
	}
};
