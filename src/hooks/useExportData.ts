import type { Log } from '@/@types/parseable/api/query';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useLogsPageContext } from '@/pages/Logs/Context';

type Data = Log[] | null;

const downloadDataAsJson = (data: Data, filename: string) => {
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

const downloadDataAsCSV = (data: Data, filename: string) => {
	if (data === null || data.length === 0) return;

	const csvString = data
		.map((row) =>
			Object.values(row)
				.map((value) => (value !== null ? value : ''))
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

export const useExportData = () => {
	const {
		state: { subLogQueryData },
	} = useLogsPageContext();
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const exportLogsHandler = (type: string) => {
		const { rawData, filteredData: _filteredData } = subLogQueryData.get(); // filteredData - records filtered with in-page search
		const query = subLogQuery.get();
		const filename = `${query.streamName}-logs`;
		type === 'JSON'
			? downloadDataAsJson(rawData, filename)
			: type === 'CSV'
			? downloadDataAsCSV(rawData, filename)
			: null;
	};

	return { exportLogsHandler };
};
