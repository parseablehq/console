import {
	Button,
	Group,
	ScrollArea,
	Stack,
	Box,
	ThemeIcon,
	Select,
	Input,
	CloseIcon,
	Pill,
	ActionIcon,
} from '@mantine/core';
import { useLogsPageContext } from './logsContextProvider';
import { IconFilter, IconPlus } from '@tabler/icons-react';
import classes from './styles/Querier.module.css';
import { Text } from '@mantine/core';
import { useQueryFilterContext, operatorLabelMap } from '@/providers/QueryFilterProvider';

export const FilterPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to add filter
		</Group>
	);
};

import { useCallback } from 'react';
import { noValueOperators, textFieldOperators, numberFieldOperators } from '@/providers/QueryFilterProvider';
import { RuleTypeOverride, RuleGroupTypeOverride, Combinator } from '@/providers/QueryFilterProvider';

type RuleSetProps = {
	ruleSet: RuleGroupTypeOverride;
};

const activeBtnClass = `${classes.toggleBtnText} ${classes.toggleBtnActive}`;
const inActiveBtnClass = classes.toggleBtnText;

type RuleViewType = {
	rule: RuleTypeOverride;
	type: 'text' | 'number' | string;
	groupId: string;
};

const RuleView = (props: RuleViewType) => {
	const { rule, type, groupId } = props;
	const {
		state: { fieldNames },
		methods: { deleteRuleFromGroup, updateRule },
	} = useQueryFilterContext();
	const onFieldChange = useCallback((field: string | null) => {
		if (field === null) return;
		updateRule(groupId, rule.id, { field });
	}, []);

	const onOperatorChange = useCallback((operator: string | null) => {
		if (operator === null) return;

		updateRule(groupId, rule.id, { operator });
	}, []);

	const onValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		updateRule(groupId, rule.id, { value: e.target.value });
	}, []);

	const deleteBtnHandler = useCallback(() => {
		deleteRuleFromGroup(groupId, rule.id);
	}, []);

	const isDisabled = noValueOperators.indexOf(rule.operator) !== -1;
	const value = isDisabled ? '' : rule.value; // hack to not to show any value at valueless rules
	const isError = !isDisabled ? value === '' : false;
	return (
		<Stack className={classes.ruleContainer}>
			<Select data={fieldNames} searchable value={rule.field} onChange={onFieldChange} w="33%" />
			<Select
				data={type === 'number' ? numberFieldOperators : textFieldOperators}
				searchable
				value={rule.operator}
				onChange={onOperatorChange}
				w="33%"
			/>
			<Input
				value={value}
				onChange={onValueChange}
				w="33%"
				classNames={{ input: classes.fieldInput }}
				error={isError}
				type={type}
				disabled={isDisabled}
			/>
			<ActionIcon className={classes.deleteRulebtn} onClick={deleteBtnHandler}>
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
			<Text className={isOrSelected ? activeBtnClass : inActiveBtnClass} onClick={() => onCombinatorChange('or')}>
				OR
			</Text>
			<Text className={!isOrSelected ? activeBtnClass : inActiveBtnClass} onClick={() => onCombinatorChange('and')}>
				AND
			</Text>
		</Box>
	);
};

const RuleSet = (props: RuleSetProps) => {
	const { state: queryBuilderState, methods: queryBuilderMethods } = useQueryFilterContext();
	const { fieldTypeMap, query } = queryBuilderState;
	const { addRuleToGroup, updateGroupCombinator, updateParentCombinator } = queryBuilderMethods;
	const { ruleSet } = props;
	const { combinator: ruleSetCombinator, id, rules } = ruleSet;

	const onCombinatorChange = useCallback((combinator: Combinator) => updateGroupCombinator(id, combinator), []);
	const addCondtionBtnHandler = useCallback(() => {
		addRuleToGroup(id);
	}, []);

	return (
		<Stack gap={0}>
			<Stack className={classes.ruleSet}>
				<CombinatorToggle isOrSelected={ruleSetCombinator === 'or'} onCombinatorChange={onCombinatorChange} />
				{rules.map((rule) => {
					return <RuleView rule={rule} key={rule.id} type={fieldTypeMap[rule.field] || 'text'} groupId={id} />;
				})}
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
			</Stack>
			<Stack style={{ height: 80, position: 'relative' }}>
				<Stack className={classes.ruleSetConnector} />
				<Stack style={{ position: 'absolute', height: 80, alignItems: 'center', justifyContent: 'center' }}>
					<Stack className={classes.parentCombinatorToggleContainer}>
						<CombinatorToggle isOrSelected={query.combinator === 'or'} onCombinatorChange={updateParentCombinator} />
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

const AddRuleGroupBtn = ({ createRuleGroup }: { createRuleGroup: () => void }) => (
	<Stack className={classes.addRuleContainer} onClick={createRuleGroup}>
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

type RuleSetPillProps = {
	ruleSet: RuleGroupTypeOverride;
};

const RuleSetPills = (props: RuleSetPillProps) => {
	const { ruleSet } = props;
	const { rules, combinator } = ruleSet;
	const {
		methods: { deleteRuleFromGroup },
	} = useQueryFilterContext();

	return (
		<Pill>
			{rules.map((rule, index) => {
				const shouldShowCombinatorPill = rules.length !== 1 && index + 1 !== rules.length;
				const operatorLabel = operatorLabelMap[rule.operator] || rule.operator;
				return (
					<span key={rule.id}>
						<Pill withRemoveButton onRemove={() => deleteRuleFromGroup(ruleSet.id, rule.id)}>
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
	const {
		state: { appliedQuery },
	} = useQueryFilterContext();
	const { combinator, rules: ruleSets } = appliedQuery;
	return (
		<ScrollArea scrollbarSize={6} scrollHideDelay={0} offsetScrollbars>
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
		</ScrollArea>
	);
};

export const FilterQueryBuilder = () => {
	const { state: queryBuilderState, methods: queryBuilderMethods } = useQueryFilterContext();
	const { query, isSumbitDisabled } = queryBuilderState;
	const { createRuleGroup, clearFilters, applyQuery } = queryBuilderMethods;
	const {
		state: {
			custQuerySearchState: { isQuerySearchActive, mode },
		},
	} = useLogsPageContext();
	const isFiltersApplied = isQuerySearchActive && mode === 'filters';

	return (
		<Stack style={{ height: 500 }}>
			<ScrollArea style={{ height: 400 }}>
				<Stack gap={0}>
					{query.rules.map((ruleSet) => {
						return <RuleSet ruleSet={ruleSet} key={ruleSet.id} />;
					})}
					<AddRuleGroupBtn createRuleGroup={createRuleGroup} />
				</Stack>
			</ScrollArea>
			<Stack className={classes.footer}>
				<Button onClick={clearFilters} disabled={!isFiltersApplied}>
					Clear
				</Button>
				<Button onClick={applyQuery} disabled={isSumbitDisabled}>
					Apply
				</Button>
			</Stack>
		</Stack>
	);
};
