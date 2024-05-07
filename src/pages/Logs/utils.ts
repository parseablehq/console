import { Log } from "@/@types/parseable/api/query";
import { LogStreamSchemaData } from "@/@types/parseable/api/stream";

export const getPageSlice = (page = 1, perPage: number, data: Log[]) => {
	const firstPageIndex = (page - 1) * perPage;
	const lastPageIndex = firstPageIndex + perPage;
	return data ? data.slice(firstPageIndex, lastPageIndex) : [];
};

export const makeHeadersFromSchema = (schema: LogStreamSchemaData | null): string[] => {
	if (schema) {
		const { fields } = schema;
		return fields.map((field) => field.name);
	} else {
		return [];
	}
};

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