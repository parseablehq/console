import {
	Button,
	Group,
	ScrollArea,
	Stack,
	Box,
	ThemeIcon,
	Select,
	CloseIcon,
	Pill,
	ActionIcon,
	Autocomplete,
} from '@mantine/core';
import { IconFilter, IconPlus } from '@tabler/icons-react';
import classes from '../../styles/Querier.module.css';
import { Text } from '@mantine/core';
export const FilterPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to add filter
		</Group>
	);
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFilterStore, filterStoreReducers, operatorLabelMap } from '../../providers/FilterProvider';
import { useLogsStore } from '../../providers/LogsProvider';
import {
	noValueOperators,
	textFieldOperators,
	numberFieldOperators,
	RuleGroupTypeOverride,
	RuleTypeOverride,
	Combinator,
} from '../../providers/FilterProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

type RuleSetProps = {
	ruleSet: RuleGroupTypeOverride;
	index: number;
};

const activeBtnClass = `${classes.toggleBtnText} ${classes.toggleBtnActive}`;
const inActiveBtnClass = classes.toggleBtnText;

const {
	createRuleGroup,
	addRuleToGroup,
	deleteRuleFromGroup,
	updateGroupCombinator,
	updateParentCombinator,
	updateRule,
	parseQuery,
} = filterStoreReducers;

type RuleViewType = {
	rule: RuleTypeOverride;
	type: 'text' | 'number' | string;
	groupId: string;
};

const RuleView = (props: RuleViewType) => {
	const { rule, type, groupId } = props;
	const [fieldNames, setFilterStore] = useFilterStore((store) => store.fieldNames);
	const [pageData] = useLogsStore((store) => store.tableOpts.pageData);
	const [columnValues, setColumnValues] = useState<string[]>([]);

	const getUniqueColValues = useMemo(() => {
		if (!rule.field) return [];
		return Array.from(
			new Set(pageData.filter((item) => item[rule.field] != null).map((item) => String(item[rule.field]))),
		);
	}, [pageData, rule.field]);

	useEffect(() => {
		if (rule.field) {
			setColumnValues(getUniqueColValues);
		}
	}, [rule.field, getUniqueColValues]);

	const onFieldChange = useCallback((field: string | null) => {
		if (field === null) return;
		setFilterStore((store) => updateRule(store, groupId, rule.id, { field }));
	}, []);

	const onOperatorChange = useCallback((operator: string | null) => {
		if (operator === null) return;
		setFilterStore((store) => updateRule(store, groupId, rule.id, { operator }));
	}, []);

	const onValueChange = useCallback((value: string) => {
		setFilterStore((store) => updateRule(store, groupId, rule.id, { value }));
	}, []);

	const deleteBtnHandler = useCallback(() => {
		setFilterStore((store) => deleteRuleFromGroup(store, groupId, rule.id));
	}, []);

	const isDisabled = noValueOperators.indexOf(rule.operator) !== -1;
	const value = isDisabled ? '' : rule.value; // hack to not to show any value at valueless rules
	const isError = !isDisabled ? value === '' : false;
	return (
		<Stack className={classes.ruleContainer}>
			<Select
				classNames={{ input: classes.selectInput, description: classes.selectDescription }}
				data={fieldNames}
				searchable
				value={rule.field}
				onChange={onFieldChange}
				w="33%"
			/>
			<Select
				classNames={{ input: classes.selectInput, description: classes.selectDescription }}
				data={type === 'number' ? numberFieldOperators : textFieldOperators}
				searchable
				value={rule.operator}
				onChange={onOperatorChange}
				w="33%"
			/>

			<Autocomplete
				value={value}
				w="33%"
				error={isError}
				limit={10}
				classNames={{ input: classes.fieldInput }}
				onChange={onValueChange}
				data={columnValues}
			/>
			<ActionIcon className={classes.deleteRulebtn} onClick={deleteBtnHandler} variant="light">
				<CloseIcon />
			</ActionIcon>
		</Stack>
	);
};

type CombinatorToggleType = {
	isOrSelected: boolean;
	onCombinatorChange: (combinator: Combinator) => void;
};

const CombinatorToggle = (props: CombinatorToggleType) => {
	const { onCombinatorChange, isOrSelected } = props;
	return (
		<Box className={classes.toggleBtnContainer}>
			<Text
				style={{ fontSize: '0.6rem' }}
				className={isOrSelected ? activeBtnClass : inActiveBtnClass}
				onClick={() => onCombinatorChange('or')}>
				OR
			</Text>
			<Text
				style={{ fontSize: '0.6rem' }}
				className={!isOrSelected ? activeBtnClass : inActiveBtnClass}
				onClick={() => onCombinatorChange('and')}>
				AND
			</Text>
		</Box>
	);
};

const RuleSet = (props: RuleSetProps) => {
	const [{ query, fieldTypeMap }, setFilterStore] = useFilterStore((store) => store);
	const { ruleSet, index } = props;
	const { combinator: ruleSetCombinator, id, rules } = ruleSet;

	const onCombinatorChange = useCallback(
		(combinator: Combinator) => setFilterStore((store) => updateGroupCombinator(store, id, combinator)),
		[],
	);
	const onParentCombinatorChange = useCallback(
		(combinator: Combinator) => setFilterStore((store) => updateParentCombinator(store, combinator)),
		[],
	);
	const addCondtionBtnHandler = useCallback(() => {
		setFilterStore((store) => addRuleToGroup(store, id));
	}, []);

	return (
		<Stack gap={0}>
			<Stack className={classes.ruleSet} gap={22}>
				<CombinatorToggle isOrSelected={ruleSetCombinator === 'or'} onCombinatorChange={onCombinatorChange} />
				{rules.map((rule) => {
					return <RuleView rule={rule} key={rule.id} type={fieldTypeMap[rule.field] || 'text'} groupId={id} />;
				})}
				{rules.length < 2 && (
					<Button
						variant="light"
						className={classes.addConditionBtn}
						leftSection={
							<ThemeIcon size="xs" p={0} variant="outline" m={0} style={{ border: 0 }}>
								<IconPlus stroke={1.5} />
							</ThemeIcon>
						}
						onClick={addCondtionBtnHandler}>
						Condition
					</Button>
				)}
			</Stack>
			{index < 1 ? (
				<Stack style={{ height: 80, position: 'relative' }}>
					<Stack className={classes.ruleSetConnector} />
					<Stack style={{ position: 'absolute', height: 80, alignItems: 'center', justifyContent: 'center' }}>
						<Stack className={classes.parentCombinatorToggleContainer}>
							<CombinatorToggle
								isOrSelected={query.combinator === 'or'}
								onCombinatorChange={onParentCombinatorChange}
							/>
						</Stack>
					</Stack>
				</Stack>
			) : null}
		</Stack>
	);
};

const AddRuleGroupBtn = () => {
	const [, setFilterStore] = useFilterStore(() => null);
	const onClick = useCallback(() => {
		setFilterStore((store) => createRuleGroup(store));
	}, []);
	return (
		<Stack className={classes.addRuleContainer} onClick={onClick}>
			<Stack style={{ flexDirection: 'row' }} align="center" gap={8}>
				<ThemeIcon radius="lg" size="sm" p={4}>
					<IconPlus stroke={3} />
				</ThemeIcon>
				<Text size="md" fw={600}>
					Add
				</Text>
			</Stack>
		</Stack>
	);
};

type RuleSetPillProps = {
	ruleSet: RuleGroupTypeOverride;
};

const RuleSetPills = (props: RuleSetPillProps) => {
	const { ruleSet } = props;
	const { rules, combinator } = ruleSet;

	const [, setFilterStore] = useFilterStore(() => null);
	const onDeleteRule = useCallback((ruleId: string) => {
		setFilterStore((store) => deleteRuleFromGroup(store, ruleSet.id, ruleId));
	}, []);
	return (
		<Pill>
			{rules.map((rule, index) => {
				const shouldShowCombinatorPill = rules.length !== 1 && index + 1 !== rules.length;
				const operatorLabel = operatorLabelMap[rule.operator] || rule.operator;
				return (
					<span key={rule.id}>
						<Pill withRemoveButton onRemove={() => onDeleteRule(rule.id)}>
							{rule.field} {operatorLabel} {rule.value}
						</Pill>
						{shouldShowCombinatorPill && <Pill className={classes.childCombinatorPill}>{combinator}</Pill>}
					</span>
				);
			})}
		</Pill>
	);
};

export const QueryPills = () => {
	const [appliedQuery] = useFilterStore((store) => store.appliedQuery);
	const { combinator, rules: ruleSets } = appliedQuery;
	return (
		<ScrollArea scrollbarSize={6} scrollHideDelay={0} offsetScrollbars={false}>
			<Stack style={{ height: '100%' }}>
				<Stack style={{ flexDirection: 'row' }} gap={8}>
					{ruleSets.map((ruleSet, index) => {
						const shouldShowCombinatorPill = ruleSets.length !== 1 && index + 1 !== ruleSets.length;
						return (
							<Stack style={{ flexDirection: 'row' }} gap={8} key={ruleSet.id}>
								<RuleSetPills ruleSet={ruleSet} />
								{shouldShowCombinatorPill && <Pill className={classes.parentCombinatorPill}>{combinator}</Pill>}
							</Stack>
						);
					})}
				</Stack>
			</Stack>
		</ScrollArea>
	);
};

export const FilterQueryBuilder = (props: {
	onClear: () => void;
	onApply: () => void;
	filterBuilderQuery?: (query: string) => void;
}) => {
	const [{ query, isSumbitDisabled, fields }, setFilterStore] = useFilterStore((store) => store);
	const [{ isQuerySearchActive, viewMode }] = useLogsStore((store) => store.custQuerySearchState);
	const isFiltersApplied = isQuerySearchActive && viewMode === 'filters';
	const { combinator, rules: ruleSets } = query;
	const [currentStream] = useAppStore((store) => store.currentStream);

	useEffect(() => {
		// init first rule
		if (query.rules.length === 0 && fields.length !== 0) {
			setFilterStore((store) => createRuleGroup(store));
		}

		const { parsedQuery } = parseQuery(query, currentStream || '');
		props.filterBuilderQuery && props.filterBuilderQuery(parsedQuery);
	}, [query.rules, fields]);

	return (
		<Stack style={{ height: '100%' }}>
			<ScrollArea scrollbarSize={6} scrollHideDelay={0} offsetScrollbars={false}>
				<Stack style={{ alignItems: 'center', justifyContent: 'center' }}>
					<Stack style={{ flexDirection: 'row' }} gap={8}>
						{ruleSets.map((ruleSet, index) => {
							const shouldShowCombinatorPill = ruleSets.length !== 1 && index + 1 !== ruleSets.length;
							return (
								<Stack style={{ flexDirection: 'row' }} gap={8} key={ruleSet.id}>
									<RuleSetPills ruleSet={ruleSet} />
									{shouldShowCombinatorPill && <Pill className={classes.parentCombinatorPill}>{combinator}</Pill>}
								</Stack>
							);
						})}
					</Stack>
				</Stack>
			</ScrollArea>
			<Stack style={{ height: '100%', justifyContent: 'space-between' }}>
				<ScrollArea>
					<Stack gap={0} pl={20} pr={20}>
						{query.rules.map((ruleSet, index) => {
							return <RuleSet ruleSet={ruleSet} key={ruleSet.id} index={index} />;
						})}
						{query.rules.length < 2 && <AddRuleGroupBtn />}
					</Stack>
				</ScrollArea>
				<Stack className={classes.footer}>
					<Button onClick={props.onClear} disabled={!isFiltersApplied} variant="outline">
						Clear
					</Button>
					<Button onClick={() => props.onApply()} disabled={isSumbitDisabled}>
						Apply
					</Button>
				</Stack>
			</Stack>
		</Stack>
	);
};
