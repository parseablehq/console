import { Group, Menu, Modal, Stack, px } from '@mantine/core';
import { IconChevronDown, IconCodeCircle, IconFilter } from '@tabler/icons-react';
import classes from '../../styles/Querier.module.css';
import { Text } from '@mantine/core';
import { FilterQueryBuilder, QueryPills } from './FilterQueryBuilder';
import { AppliedSQLQuery } from './QueryEditor';
import QueryCodeEditor from './QueryCodeEditor';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useCallback, useEffect, useRef } from 'react';
import { filterStoreReducers, noValueOperators, useFilterStore } from '../../providers/FilterProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useStreamStore } from '../../providers/StreamProvider';

const { setFields, parseQuery, storeAppliedQuery, resetFilters, toggleSubmitBtn } = filterStoreReducers;
const { toggleQueryBuilder, toggleCustQuerySearchViewMode, applyCustomQuery, resetCustQuerySearchState } =
	logsStoreReducers;

const getLabel = (mode: string | null) => {
	return mode === 'filters' ? 'Filters' : mode === 'sql' ? 'SQL' : '';
};

const FilterPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'1rem'} stroke={1.8} style={{ marginRight: 6 }} />
			<Text size="md">Click to add filter</Text>
		</Group>
	);
};

const SQLEditorPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconCodeCircle size={'1rem'} stroke={1.8} style={{ marginRight: 6 }} />
			<Text size="md">Click to write query</Text>
		</Group>
	);
};

const ModalTitle = ({ title }: { title: string }) => {
	return <Text style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.5rem' }}>{title}</Text>;
};

const QuerierModal = (props: {
	onClear: () => void;
	onSqlSearchApply: (query: string) => void;
	onFiltersApply: () => void;
}) => {
	const [{ showQueryBuilder, viewMode }, setLogsStore] = useLogsStore((store) => store.custQuerySearchState);
	const onClose = useCallback(() => {
		setLogsStore((store) => toggleQueryBuilder(store, false));
	}, []);
	const queryCodeEditorRef = useRef<any>(''); // to store input value even after the editor unmounts

	return (
		<Modal
			opened={showQueryBuilder}
			onClose={onClose}
			size="auto"
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle title={getLabel(viewMode)} />}>
			<Stack style={{ width: '40rem', padding: '1rem', height: '100%' }} gap={0}>
				{viewMode === 'filters' ? (
					<FilterQueryBuilder onClear={props.onClear} onApply={props.onFiltersApply} />
				) : (
					<QueryCodeEditor
						queryCodeEditorRef={queryCodeEditorRef}
						onSqlSearchApply={props.onSqlSearchApply}
						onClear={props.onClear}
					/>
				)}
			</Stack>
		</Modal>
	);
};

const Querier = () => {
	const [{ isQuerySearchActive, viewMode, showQueryBuilder, activeMode }, setLogsStore] = useLogsStore(
		(store) => store.custQuerySearchState,
	);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const openBuilderModal = useCallback(() => {
		setLogsStore((store) => toggleQueryBuilder(store));
	}, []);
	const [schema] = useStreamStore((store) => store.schema);
	const [{ query, isSumbitDisabled }, setFilterStore] = useFilterStore((store) => store);

	useEffect(() => {
		if (schema) {
			setFilterStore((store) => setFields(store, schema));
		}
	}, [schema]);

	useEffect(() => {
		return setFilterStore(resetFilters);
	}, []);

	const triggerRefetch = useCallback((query: string, mode: 'filters' | 'sql') => {
		setLogsStore((store) => applyCustomQuery(store, query, mode));
	}, []);

	const onFiltersApply = useCallback(() => {
		if (!currentStream) return;

		const { parsedQuery } = parseQuery(query, currentStream);
		setFilterStore((store) => storeAppliedQuery(store));
		triggerRefetch(parsedQuery, 'filters');
	}, [query, currentStream]);

	const onSqlSearchApply = useCallback(
		(query: string) => {
			if (!currentStream) return;

			setFilterStore((store) => resetFilters(store));
			triggerRefetch(query, 'sql');
		},
		[currentStream],
	);

	const onClear = useCallback(() => {
		setFilterStore((store) => resetFilters(store));
		setLogsStore((store) => resetCustQuerySearchState(store));
	}, []);

	useEffect(() => {
		// toggle submit btn - enable / disable
		const ruleSets = query.rules.map((r) => r.rules);
		const allValues = ruleSets.flat().flatMap((rule) => {
			return noValueOperators.indexOf(rule.operator) !== -1 ? [null] : [rule.value];
		});
		const shouldSumbitDisabled = allValues.length === 0 || allValues.some((value) => value === '');
		if (isSumbitDisabled !== shouldSumbitDisabled) {
			setFilterStore((store) => toggleSubmitBtn(store, shouldSumbitDisabled));
		}

		// trigger query fetch if the rules were updated by the remove btn on pills
		if (!showQueryBuilder) {
			if (!shouldSumbitDisabled) {
				onFiltersApply();
			}

			if (allValues.length === 0) {
				onClear();
			}
		}

		// trigger reset when no active rules are available
		if (isQuerySearchActive && allValues.length === 0) {
			onClear();
		}
	}, [query.rules]);

	const onChangeCustQueryViewMode = useCallback((mode: 'sql' | 'filters') => {
		setLogsStore((store) => toggleCustQuerySearchViewMode(store, mode));
	}, []);

	return (
		<Stack gap={0} style={{ flexDirection: 'row' }} className={classes.container}>
			<QuerierModal onSqlSearchApply={onSqlSearchApply} onFiltersApply={onFiltersApply} onClear={onClear} />
			<Menu position="bottom">
				<Menu.Target>
					<Stack
						gap={0}
						style={{
							borderRight: '1px solid #e9ecef',
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0 1rem',
						}}>
						<Text style={{fontSize: '0.75rem', fontWeight: 500}}>{getLabel(viewMode)}</Text>
						<IconChevronDown size={px('1rem')} stroke={1.8} />
					</Stack>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item
						onClick={() => onChangeCustQueryViewMode('filters')}
						style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
						Filters
					</Menu.Item>
					<Menu.Item
						onClick={() => onChangeCustQueryViewMode('sql')}
						style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
						SQL
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<Stack style={{ width: '100%' }} gap={0} onClick={openBuilderModal} className={classes.filterContainer}>
				{viewMode === 'filters' && (activeMode === 'filters' ? <QueryPills /> : <FilterPlaceholder />)}
				{viewMode === 'sql' && (activeMode === 'sql' ? <AppliedSQLQuery /> : <SQLEditorPlaceholder />)}
			</Stack>
		</Stack>
	);
};

export default Querier;
