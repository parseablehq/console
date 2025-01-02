import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { generateRandomId } from '@/utils';
import initContext from '@/utils/initContext';
import { FilterQueryBuilder } from '@/utils/queryBuilder';
import { Field, RuleGroupType, RuleType, formatQuery } from 'react-querybuilder';
import { LOAD_LIMIT } from './LogsProvider';
import { timeRangeSQLCondition } from '@/api/query';
import { QueryEngineType } from '@/@types/parseable/api/about';

// write transformer (for saved filters) if you are updating the operators below
export const textFieldOperators = [
	{ value: '=', label: 'equals to' },
	{ value: '!=', label: 'not equals to' },
	{ value: 'ilike', label: 'case-insensitive match' },
	{ value: 'contains', label: 'contains' },
	{ value: 'beginsWith', label: 'begins with' },
	{ value: 'endsWith', label: 'ends with' },
	{ value: 'doesNotContain', label: 'does not contain' },
	{ value: 'doesNotBeginWith', label: 'does not begin with' },
	{ value: 'doesNotEndWith', label: 'does not end with' },
	{ value: 'null', label: 'is null' },
	{ value: 'notNull', label: 'is not null' },
];

export const numberFieldOperators = [
	{ value: '=', label: '=' },
	{ value: '!=', label: '!=' },
	{ value: '<', label: '<' },
	{ value: '>', label: '>' },
	{ value: '<=', label: '<=' },
	{ value: '>=', label: '>=' },
	{ value: 'null', label: 'is null' },
	{ value: 'notNull', label: 'is not null' },
	// { name: 'in', label: 'in' },
	// { name: 'notIn', label: 'not in' },
	// { name: 'between', label: 'between' },
	// { name: 'notBetween', label: 'not between' },
];

export type RuleTypeOverride = Omit<RuleType, 'id'> & {
	id: string;
};

export type RuleGroupTypeOverride = Omit<RuleGroupType, 'id' | 'rules'> & {
	id: string;
	rules: RuleTypeOverride[];
};

export type QueryType = Omit<RuleGroupType, 'rules'> & {
	rules: RuleGroupTypeOverride[]; //
};

export type Combinator = 'or' | 'and';

type FieldTypeMap = {
	[key: string]: 'text' | 'number';
};

type UpdateRuleType = {
	ruleSet: RuleGroupTypeOverride;
	ruleId: string;
	updateOpts: RuleUpdateOpts;
};

type FilterStore = {
	fields: Field[];
	query: QueryType;
	appliedFilterQuery: string;
	fieldTypeMap: FieldTypeMap;
	fieldNames: string[];
	isSumbitDisabled: boolean;
	isQueryFromParams: boolean;
	appliedQuery: QueryType;
	isSaveFiltersModalOpen: boolean;
	isSavedFiltersModalOpen: boolean;
};

type RuleUpdateOpts = {
	field?: string;
	operator?: string;
	value?: string | null;
};

const defaultQuery = {
	id: 'root',
	combinator: 'or',
	rules: [],
};

const initialState: FilterStore = {
	fields: [],
	query: defaultQuery,
	appliedFilterQuery: '',
	fieldTypeMap: {},
	fieldNames: [],
	isQueryFromParams: false,
	isSumbitDisabled: true,
	appliedQuery: defaultQuery,
	isSaveFiltersModalOpen: false,
	isSavedFiltersModalOpen: false,
};

type ReducerOutput = Partial<FilterStore>;

export const operatorLabelMap: { [key: string]: string } = {
	'=': '=',
	'!=': '!=',
	contains: 'contains',
	beginsWith: 'begins with',
	endsWith: 'ends with',
	doesNotContain: 'does not contain',
	doesNotBeginWith: 'does not begin with',
	doesNotEndWith: 'does not end with',
	null: 'is null',
	notNull: 'is not null',
	'<': '<',
	'>': '>',
	'<=': '<=',
	'>=': '>=',
	in: 'in',
	notIn: 'not in',
	between: 'between',
	notBetween: 'not between',
};

type FilterStoreReducers = {
	createRuleGroup: (store: FilterStore) => ReducerOutput;
	storeAppliedQuery: (store: FilterStore) => ReducerOutput;
	resetFilters: (store: FilterStore) => ReducerOutput;
	setFields: (store: FilterStore, schema: LogStreamSchemaData) => ReducerOutput;
	addRuleToGroup: (store: FilterStore, groupId: string) => ReducerOutput;
	deleteRuleFromGroup: (store: FilterStore, groupId: string, ruleId: string) => ReducerOutput;
	updateGroupCombinator: (store: FilterStore, id: string, op: Combinator) => ReducerOutput;
	updateParentCombinator: (store: FilterStore, combinator: Combinator) => ReducerOutput;
	updateAppliedQuery: (store: FilterStore, appliedQuery: QueryType) => ReducerOutput;
	updateRule: (store: FilterStore, groupId: string, ruleId: string, updateOpts: RuleUpdateOpts) => ReducerOutput;
	updateQuery: (store: FilterStore, query: QueryType) => ReducerOutput;
	parseQuery: (
		queryEngine: 'Parseable' | 'Trino' | undefined,
		query: QueryType,
		currentStream: string,
		timeRangeOpts?: { startTime: Date; endTime: Date; timePartitionColumn: string },
	) => { where: string; parsedQuery: string };
	toggleSubmitBtn: (store: FilterStore, val: boolean) => ReducerOutput;
	toogleQueryParamsFlag: (store: FilterStore, val: boolean) => ReducerOutput;
	toggleSaveFiltersModal: (_store: FilterStore, val: boolean) => ReducerOutput;
	toggleSavedFiltersModal: (_store: FilterStore, val: boolean) => ReducerOutput;
	applySavedFilters: (store: FilterStore, query: QueryType) => ReducerOutput;
	setAppliedFilterQuery: (store: FilterStore, query: string | undefined) => ReducerOutput;
	clearAppliedFilterQuery: (_store: FilterStore) => ReducerOutput;
};

const { Provider: FilterProvider, useStore: useFilterStore } = initContext(initialState);

const createRuleGroup = (store: FilterStore) => {
	const { fields, query } = store;
	if (fields.length === 0) return {};

	const defaultRule = { id: `rule-${generateRandomId(6)}`, field: fields[0].name, value: '', operator: '=' };
	const newGroup = { id: `ruleset-${generateRandomId(6)}`, combinator: 'or', rules: [defaultRule] };
	return { query: { ...query, rules: [...query.rules, newGroup] } };
};

const addRuleToGroup = (store: FilterStore, groupId: string) => {
	const { fields, query } = store;
	if (fields.length === 0) return {};

	return {
		query: {
			...query,
			rules: query.rules.map((ruleSet) => {
				return ruleSet.id !== groupId
					? ruleSet
					: {
							...ruleSet,
							rules: [
								...ruleSet.rules,
								{ id: `rule-${generateRandomId(6)}`, field: fields[0].name, value: '', operator: '=' },
							],
					  };
			}),
		},
	};
};

const toogleQueryParamsFlag = (_store: FilterStore, val: boolean) => {
	return {
		..._store,
		isQueryFromParams: val,
	};
};

const deleteRuleFromGroup = (store: FilterStore, groupId: string, ruleId: string) => {
	const { fields, query } = store;
	if (fields.length === 0) return {};

	const groupIndex = query.rules.findIndex((group) => group.id === groupId);
	if (groupIndex === -1) return {};

	const group = query.rules[groupIndex];
	if (group.rules.length === 1) {
		const updatedRules = query.rules.filter((group) => group.id !== groupId);
		return { query: { ...query, rules: updatedRules } };
	}

	const updatedGroup = {
		...group,
		rules: group.rules.filter((rule) => rule.id !== ruleId),
	};
	const updatedRules = [...query.rules];
	updatedRules[groupIndex] = updatedGroup;

	return { query: { ...query, rules: updatedRules } };
};

const updateGroupCombinator = (store: FilterStore, id: string, op: Combinator) => {
	const { query } = store;
	const updatedRules = query.rules.map((rule) => (rule.id === id ? { ...rule, combinator: op } : rule));
	return {
		query: {
			...query,
			rules: updatedRules,
		},
	};
};

const findAndUpdateRule = (opts: UpdateRuleType) => {
	const { ruleSet, ruleId, updateOpts } = opts;
	const updatedRuleObj = {
		...('field' in updateOpts ? { field: updateOpts.field, operator: '=', value: '' } : updateOpts),
	};
	const updatedRules = ruleSet.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updatedRuleObj } : rule));
	return { ...ruleSet, rules: updatedRules };
};

const updateRule = (store: FilterStore, groupId: string, ruleId: string, updateOpts: RuleUpdateOpts) => {
	const { query } = store;
	return {
		query: {
			...query,
			rules: query.rules.map((ruleSet) => {
				return ruleSet.id !== groupId ? ruleSet : findAndUpdateRule({ ruleSet, ruleId, updateOpts });
			}),
		},
	};
};

const updateParentCombinator = (store: FilterStore, combinator: Combinator) => {
	const { query } = store;
	return { query: { ...query, combinator: combinator } };
};

const setAppliedFilterQuery = (_store: FilterStore, query: string | undefined) => {
	return {
		..._store,
		appliedFilterQuery: query ?? '',
	};
};

// clears applied filter query from filter store
const clearAppliedFilterQuery = (_store: FilterStore) => {
	return {
		..._store,
		appliedFilterQuery: '',
	};
};

export const noValueOperators = ['null', 'notNull'];

const toggleSubmitBtn = (_store: FilterStore, val: boolean) => {
	return {
		isSumbitDisabled: val,
	};
};

// todo - custom rule processor to prevent converting number strings into numbers for text fields
const parseQuery = (
	queryEngine: QueryEngineType,
	query: QueryType,
	currentStream: string,
	timeRangeOpts?: { startTime: Date; endTime: Date; timePartitionColumn: string },
) => {
	// todo - custom rule processor to prevent converting number strings into numbers for text fields
	const where = formatQuery(query, { format: 'sql', parseNumbers: true, quoteFieldNamesWith: ['"', '"'] });
	const timeRangeCondition = timeRangeOpts
		? timeRangeSQLCondition(timeRangeOpts.timePartitionColumn, timeRangeOpts.startTime, timeRangeOpts.endTime)
		: '(1=1)';

	const filterQueryBuilder = new FilterQueryBuilder({
		queryEngine,
		streamName: currentStream,
		whereClause: where,
		timeRangeCondition,
		limit: LOAD_LIMIT,
	});
	return { where, parsedQuery: filterQueryBuilder.getQuery() };
};

const storeAppliedQuery = (store: FilterStore) => {
	const { query } = store;
	return {
		appliedQuery: query,
	};
};

const resetFilters = (store: FilterStore) => {
	const { fields, fieldTypeMap, fieldNames } = store;
	return {
		...initialState,
		fields,
		fieldTypeMap,
		fieldNames,
	};
};

const parseType = (type: any): 'text' | 'number' => {
	if (typeof type === 'object') {
		console.error('Error finding type for an object', type);
		return 'text';
	}
	const lowercaseType = type.toLowerCase();
	if (lowercaseType.startsWith('int') || lowercaseType.startsWith('float') || lowercaseType.startsWith('double')) {
		return 'number';
	} else {
		return 'text';
	}
};

const validator = (r: RuleType) => !!r.value;

const setFields = (_store: FilterStore, schema: LogStreamSchemaData) => {
	const fields: Field[] = schema.fields
		.filter((field) => field.name !== 'p_timestamp')
		.map((field) => ({
			name: field.name,
			label: field.name,
			inputType: parseType(field.data_type),
			validator,
		}));
	const fieldTypeMap = fields.reduce((acc, field) => {
		return { ...acc, [field.name]: field.inputType };
	}, {});
	const fieldNames = fields.map((field) => field.name);

	return {
		fields,
		fieldTypeMap,
		fieldNames,
	};
};

const toggleSaveFiltersModal = (_store: FilterStore, val: boolean) => {
	return {
		isSaveFiltersModalOpen: val,
	};
};

const toggleSavedFiltersModal = (_store: FilterStore, val: boolean) => {
	return {
		isSavedFiltersModalOpen: val,
	};
};

const updateAppliedQuery = (store: FilterStore, appliedQuery: QueryType) => {
	return {
		...store,
		appliedQuery,
	};
};

const updateQuery = (store: FilterStore, query: QueryType) => {
	return {
		...store,
		query,
	};
};

const applySavedFilters = (store: FilterStore, query: QueryType) => {
	return {
		...store,
		appliedQuery: query,
		query,
		isSumbitDisabled: true,
	};
};

const filterStoreReducers: FilterStoreReducers = {
	storeAppliedQuery,
	resetFilters,
	createRuleGroup,
	setFields,
	addRuleToGroup,
	deleteRuleFromGroup,
	updateGroupCombinator,
	updateParentCombinator,
	updateAppliedQuery,
	updateRule,
	updateQuery,
	parseQuery,
	toggleSubmitBtn,
	toggleSaveFiltersModal,
	toggleSavedFiltersModal,
	toogleQueryParamsFlag,
	applySavedFilters,
	setAppliedFilterQuery,
	clearAppliedFilterQuery,
};

export { FilterProvider, useFilterStore, filterStoreReducers };
