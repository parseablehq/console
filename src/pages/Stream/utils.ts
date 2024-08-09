import { Log } from "@/@types/parseable/api/query";
import { LogStreamQueryWithFields } from "@/@types/parseable/api/stream";
import { columnsToSkip } from "./providers/LogsProvider";

export const getPageSlice = (page = 1, perPage: number, data: Log[]) => {
	const firstPageIndex = (page - 1) * perPage;
	const lastPageIndex = firstPageIndex + perPage;
	return data ? data.slice(firstPageIndex, lastPageIndex) : [];
};


export const makeHeadersFromQueryFields = (queryResponse: LogStreamQueryWithFields |null): string[] =>{
	if (queryResponse) {
		const {fields} = queryResponse;
		return fields
	}
	return []
}

export const makeHeadersfromData = (data: Log[]): string[] => {
	const allKeys: string[] = [];

	// cannot parse cust search query and get the possible keys. 
	// and also its not necessary that each record will have all the specified columns
	// so go through all the records and get the keys
	data.forEach((obj) => {
		Object.keys(obj).forEach((key) => {
			if (!allKeys.includes(key)) {
				allKeys.push(key);
			}
		});
	});

	return allKeys;
};

export const genColumnsToShow = (opts: {disabledColumns: string[], headers: string[], isPinned: boolean, pinnedColumns: string[]}) => {
	const {disabledColumns, headers, isPinned, pinnedColumns} = opts;

	const columnsToIgnore = [
		...disabledColumns,
		...columnsToSkip,
		...headers.filter((header) => (isPinned ? !pinnedColumns.includes(header) : pinnedColumns.includes(header))),
	];
	return headers.filter((header) => !columnsToIgnore.includes(header));
}