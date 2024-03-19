import { useAppStore } from '@/layouts/MainLayout/AppProvider';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useLogsPageContext } from '@/pages/Logs/logsContextProvider';
import { generateRandomId } from '@/utils';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Field, RuleGroupType, RuleType, formatQuery } from 'react-querybuilder';

const Context = createContext({});
const { Provider } = Context;

interface QueryFilterProviderProps {
	children: ReactNode;
}

type FieldTypeMap = {
	[key: string]: 'text' | 'number';
};

type QueryFilterContextState = {
	isModalOpen: boolean;
	fields: Field[];
	query: QueryType;
	fieldTypeMap: FieldTypeMap;
	fieldNames: string[];
	isSumbitDisabled: boolean;
	appliedQuery: QueryType;
};

type QueryFilterContextMethods = {
	createRuleGroup: () => void;
	addRuleToGroup: (groupId: string) => void;
	deleteRuleFromGroup: (groupId: string, ruleId: string) => void;
	updateGroupCombinator: (id: string, op: Combinator) => void;
	updateRule: (groupId: string, ruleId: string, updateOpts: RuleUpdateOpts) => void;
	updateParentCombinator: (combinator: Combinator) => void;
	parseQuery: () => string;
	applyQuery: () => void;
	clearFilters: () => void;
	closeBuilderModal: () => void;
};

type QueryFilterContextValue = {
	state: QueryFilterContextState;
	methods: QueryFilterContextMethods;
};

// forcing optional fields to be mandatory
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

type RuleUpdateOpts = {
	field?: string;
	operator?: string;
	value?: string | null;
};

type UpdateRuleType = {
	ruleSet: RuleGroupTypeOverride;
	ruleId: string;
	updateOpts: RuleUpdateOpts;
};

export type Combinator = 'or' | 'and';

const validator = (r: RuleType) => !!r.value;

export const noValueOperators = ['null', 'notNull'];

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

export const textFieldOperators = [
	{ value: '=', label: '=' },
	{ value: '!=', label: '!=' },
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

const findAndUpdateRule = (opts: UpdateRuleType) => {
	const { ruleSet, ruleId, updateOpts } = opts;
	const updatedRuleObj = {
		...('field' in updateOpts ? { field: updateOpts.field, operator: '=', value: '' } : updateOpts),
	};
	const updatedRules = ruleSet.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updatedRuleObj } : rule));
	return { ...ruleSet, rules: updatedRules };
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

const defaultQuery = {
	id: 'root',
	combinator: 'or',
	rules: [],
};

const QueryFilterProvider = (props: QueryFilterProviderProps) => {
	const [isSumbitDisabled, setSubmitDisabled] = useState<boolean>(true);
	const {
		state: { subLogStreamSchema, custQuerySearchState, builderModalOpen: isModalOpen },
		methods: { setCustSearchQuery, resetQuerySearch, closeBuilderModal },
	} = useLogsPageContext();
	const [fields, setFields] = useState<Field[]>([]);
	const [query, setQuery] = useState<QueryType>(defaultQuery);
	const [appliedQuery, setAppliedQuery] = useState<QueryType>(defaultQuery);
	const [fieldTypeMap, setFieldTypeMap] = useState<FieldTypeMap>({});
	const [fieldNames, setFieldNames] = useState<string[]>([]);
	const [currentStream] = useAppStore(store => store.currentStream)

	const createRuleGroup = useCallback(() => {
		return setQuery((prevState) => {
			if (fields.length === 0) return prevState;

			const defaultRule = { id: `rule-${generateRandomId(6)}`, field: fields[0].name, value: '', operator: '=' };
			const newGroup = { id: `ruleset-${generateRandomId(6)}`, combinator: 'or', rules: [defaultRule] };
			return { ...prevState, rules: [...prevState.rules, newGroup] };
		});
	}, [fields]);

	const addRuleToGroup = useCallback(
		(groupId: string) => {
			setQuery((prev) => {
				if (fields.length === 0) return prev;

				return {
					...prev,
					rules: prev.rules.map((ruleSet) => {
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
				};
			});
		},
		[fields],
	);

	const deleteRuleFromGroup = useCallback(
		(groupId: string, ruleId: string) => {
			setQuery((prev) => {
				if (fields.length === 0) return prev;

				const groupIndex = prev.rules.findIndex((group) => group.id === groupId);
				if (groupIndex === -1) return prev;

				const group = prev.rules[groupIndex];
				if (group.rules.length === 1) {
					const updatedRules = prev.rules.filter((group) => group.id !== groupId);
					return { ...prev, rules: updatedRules };
				}

				const updatedGroup = {
					...group,
					rules: group.rules.filter((rule) => rule.id !== ruleId),
				};
				const updatedRules = [...prev.rules];
				updatedRules[groupIndex] = updatedGroup;

				return { ...prev, rules: updatedRules };
			});
		},
		[fields],
	);

	const updateGroupCombinator = useCallback((id: string, op: Combinator) => {
		setQuery((prev) => {
			return {
				...prev,
				rules: prev.rules.map((rule) => (rule.id === id ? { ...rule, combinator: op } : rule)),
			};
		});
	}, []);

	const updateRule = useCallback((groupId: string, ruleId: string, updateOpts: RuleUpdateOpts) => {
		setQuery((prev) => {
			return {
				...prev,
				rules: prev.rules.map((ruleSet) => {
					return ruleSet.id !== groupId ? ruleSet : findAndUpdateRule({ ruleSet, ruleId, updateOpts });
				}),
			};
		});
	}, []);

	const updateParentCombinator = useCallback((combinator: Combinator) => {
		return setQuery((prev) => {
			return { ...prev, combinator: combinator };
		});
	}, []);

	const parseQuery = useCallback(() => {
		// todo - custom rule processor to prevent converting number strings into numbers for text fields
		const where = formatQuery(query, { format: 'sql', parseNumbers: true, quoteFieldNamesWith: ['\"', '\"'] });
		return `select * from ${currentStream} where ${where} limit 9000`;
	}, [query]);

	const applyQuery = useCallback(() => {
		const parsedQuery = parseQuery();
		setCustSearchQuery(parsedQuery, 'filters');
		setAppliedQuery(query);
		closeBuilderModal()
	}, [query]);

	const clearFilters = useCallback(() => {
		resetQuerySearch();
		closeBuilderModal();
		setAppliedQuery(defaultQuery);
		setQuery(defaultQuery);
	}, []);

	const schemaFields = subLogStreamSchema.get()?.fields;
	useEffect(() => {
		if (!schemaFields || schemaFields?.length === 0) return;

		const fields: Field[] = schemaFields
			.filter((field) => field.name !== 'p_timestamp')
			.map((field) => ({
				name: field.name,
				label: field.name,
				inputType: parseType(field.data_type),
				validator,
			}));
		setFields(fields);
		const fieldTypeMap = fields.reduce((acc, field) => {
			return { ...acc, [field.name]: field.inputType };
		}, {});
		const allFieldNames = fields.map((field) => field.name);
		setFieldTypeMap(fieldTypeMap);
		setFieldNames(allFieldNames);
	}, [schemaFields]);

	useEffect(() => {
		if (query.rules.length === 0) {
			createRuleGroup();
		}
	}, [fields]);

	useEffect(() => {
		const ruleSets = query.rules.map((r) => r.rules);
		const allValues = ruleSets.flat().flatMap((rule) => {
			return noValueOperators.indexOf(rule.operator) !== -1 ? [null] : [rule.value];
		});

		const shouldSumbitDisabled = allValues.length === 0 || allValues.some((value) => value === '');
		if (isSumbitDisabled !== shouldSumbitDisabled) {
			setSubmitDisabled(shouldSumbitDisabled);
		}

		// trigger query fetch if the rules were updated by the remove btn on pills
		if (!isModalOpen) {
			if (!shouldSumbitDisabled) {
				applyQuery();
			}

			if (allValues.length === 0) {
				clearFilters();
				setAppliedQuery(defaultQuery);
			}
		}

		// trigger reset when no active rules are available
		if (custQuerySearchState.isQuerySearchActive && allValues.length === 0) {
			clearFilters();
			setAppliedQuery(defaultQuery);
		}
	}, [query.rules]);

	const state: QueryFilterContextState = {
		isModalOpen,
		fields,
		query,
		fieldTypeMap,
		fieldNames,
		isSumbitDisabled,
		appliedQuery,
	};
	const methods: QueryFilterContextMethods = {
		createRuleGroup,
		addRuleToGroup,
		deleteRuleFromGroup,
		updateGroupCombinator,
		updateRule,
		updateParentCombinator,
		parseQuery,
		applyQuery,
		clearFilters,
		closeBuilderModal,
	};
	const value = useMemo(() => ({ state, methods }), [state, methods]);

	return <Provider value={value}>{props.children}</Provider>;
};

export const useQueryFilterContext = () => useContext(Context) as QueryFilterContextValue;

export default QueryFilterProvider;
