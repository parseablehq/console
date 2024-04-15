import { generateRandomId } from '@/utils';
import createFastContext from '@/utils/createFastContext';
import { Field, RuleGroupType, RuleType, formatQuery } from 'react-querybuilder';

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

type FilterStore = {
	isModalOpen: boolean;
	fields: Field[];
	query: QueryType;
	fieldTypeMap: FieldTypeMap;
	fieldNames: string[];
	isSumbitDisabled: boolean;
	appliedQuery: QueryType;
};

const defaultQuery = {
	id: 'root',
	combinator: 'or',
	rules: [],
};

const initialState: FilterStore = {
	isModalOpen: false,
	fields: [],
	query: defaultQuery,
	fieldTypeMap: {},
	fieldNames: [],
	isSumbitDisabled: true,
	appliedQuery: defaultQuery,
};

const { Provider: FilterProvider, useStore: useFilterStore } = createFastContext(initialState);

const filterStoreReducers = {};

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

// todo - custom rule processor to prevent converting number strings into numbers for text fields
const parseQuery = (query) => {
    const 
	const where = formatQuery(query, { format: 'sql', parseNumbers: true, quoteFieldNamesWith: ['"', '"'] });
	// error
};

export { FilterProvider, useFilterStore };
