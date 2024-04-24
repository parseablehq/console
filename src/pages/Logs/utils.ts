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

export const makeHeadersfromData = (schema: LogStreamSchemaData, custSearchQuery: string | null): string[] => {
	const allColumns = makeHeadersFromSchema(schema);
	if (custSearchQuery === null) return allColumns;

	const selectClause = custSearchQuery.match(/SELECT(.*?)FROM/i)?.[1];
	if (!selectClause || selectClause.includes('*')) return allColumns;

	const commonColumns = allColumns.filter((column) => selectClause.includes(column));
	return commonColumns;
};