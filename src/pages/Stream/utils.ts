import { Log } from '@/@types/parseable/api/query';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { columnsToSkip } from './providers/LogsProvider';
import { parseSQL } from 'react-querybuilder';
import { QueryType, RuleGroupTypeOverride, RuleTypeOverride } from './providers/FilterProvider';

export const getPageSlice = (page = 1, perPage: number, data: Log[]) => {
	const firstPageIndex = (page - 1) * perPage;
	const lastPageIndex = firstPageIndex + perPage;
	return data ? data.slice(firstPageIndex, lastPageIndex) : [];
};

export const generateQueryBuilderASTFromSQL = (sqlString: string) => {
	const parsedQuery = parseSQL(sqlString) as QueryType;

	function isRuleGroup(rule: RuleTypeOverride | RuleGroupTypeOverride): rule is RuleGroupTypeOverride {
		return 'combinator' in rule && 'rules' in rule;
	}

	function addIds(query: QueryType | RuleGroupTypeOverride) {
		if (Array.isArray(query.rules)) {
			query.rules.forEach((rule) => {
				rule.id = `rule-${Math.random()}`;

				if (isRuleGroup(rule)) {
					addIds(rule);
				}
			});
		}
	}

	addIds(parsedQuery);
	return parsedQuery;
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

export const genColumnsToShow = (opts: {
	disabledColumns: string[];
	headers: string[];
	isPinned: boolean;
	pinnedColumns: string[];
}) => {
	const { disabledColumns, headers, isPinned, pinnedColumns } = opts;

	const columnsToIgnore = [
		...disabledColumns,
		...columnsToSkip,
		...headers.filter((header) => (isPinned ? !pinnedColumns.includes(header) : pinnedColumns.includes(header))),
	];
	return headers.filter((header) => !columnsToIgnore.includes(header));
};

export const isRowHighlighted = (index: number, rowNumber: string) => {
	if (!rowNumber) return false;
	const [start, end] = rowNumber.split(':').map(Number);
	return index >= start && index <= end;
};

export const isFirstRowInRange = (index: number, rowNumber: string) => {
	if (!rowNumber) return false;
	const [start] = rowNumber.split(':').map(Number);
	return index === start;
};
