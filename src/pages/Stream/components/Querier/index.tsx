import { Group, Menu, Modal, Stack, px, Tooltip, Tabs } from '@mantine/core';
import { IconChevronDown, IconCodeCircle, IconFilter, IconFilterEdit, IconFilterPlus } from '@tabler/icons-react';
import classes from '../../styles/Querier.module.css';
import { Text } from '@mantine/core';
import { FilterQueryBuilder, QueryPills } from './FilterQueryBuilder';
import { AppliedSQLQuery } from './QueryEditor';
import QueryCodeEditor, { defaultCustSQLQuery } from './QueryCodeEditor';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useCallback, useEffect, useRef } from 'react';
import { filterStoreReducers, noValueOperators, useFilterStore } from '../../providers/FilterProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useStreamStore } from '../../providers/StreamProvider';
import SaveFilterModal from './SaveFilterModal';
import SavedFiltersModal from './SavedFiltersModal';
import _ from 'lodash';

const { setFields, parseQuery, storeAppliedQuery, resetFilters, toggleSubmitBtn, toggleSaveFiltersModal } =
	filterStoreReducers;
const { toggleQueryBuilder, toggleCustQuerySearchViewMode, applyCustomQuery, resetCustQuerySearchState } =
	logsStoreReducers;

const getLabel = (mode: string | null) => {
	return mode === 'filters' ? 'Filters' : mode === 'sql' ? 'SQL' : '';
};

const FilterPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'0.8rem'} stroke={1.8} style={{ marginRight: 6 }} />
			<Text style={{ fontSize: '0.65rem', fontWeight: 600 }}>Click to add filter</Text>
		</Group>
	);
};

const SQLEditorPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconCodeCircle size={'1rem'} stroke={1.8} style={{ marginRight: 6 }} />
			<Text style={{ fontSize: '0.65rem', fontWeight: 600 }}>Click to write query</Text>
		</Group>
	);
};

const ModalTitle = ({ title }: { title: string }) => {
	const [, setLogsStore] = useLogsStore((store) => store.custQuerySearchState);
	const onChangeCustQueryViewMode = useCallback((mode: 'sql' | 'filters') => {
		setLogsStore((store) => toggleCustQuerySearchViewMode(store, mode));
	}, []);

	return (
		<Tabs defaultValue={title} style={{ padding: '0 0.4rem', outline: 'none' }}>
			<Tabs.List>
				<Tabs.Tab
					className={title !== 'Filters' ? classes.tab : ''}
					value="Filters"
					onClick={() => onChangeCustQueryViewMode('filters')}>
					<Text style={{ fontSize: '1rem', fontWeight: 600 }}>Filters</Text>
				</Tabs.Tab>
				<Tabs.Tab
					className={title !== 'SQL' ? classes.tab : ''}
					value="SQL"
					onClick={() => onChangeCustQueryViewMode('sql')}>
					<Text style={{ fontSize: '1rem', fontWeight: 600 }}>SQL</Text>
				</Tabs.Tab>
			</Tabs.List>
		</Tabs>
	);
};

const QuerierModal = (props: {
	onClear: () => void;
	onSqlSearchApply: (query: string) => void;
	onFiltersApply: () => void;
}) => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ showQueryBuilder, viewMode }, setLogsStore] = useLogsStore((store) => store.custQuerySearchState);
	const [streamInfo] = useStreamStore((store) => store.info);
	const [timeRange] = useLogsStore((store) => store.timeRange);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const onClose = useCallback(() => {
		setLogsStore((store) => toggleQueryBuilder(store, false));
	}, []);
	const queryCodeEditorRef = useRef<any>(''); // to store input value even after the editor unmounts

	useEffect(() => {
		queryCodeEditorRef.current = defaultCustSQLQuery(
			currentStream,
			timeRange.startTime,
			timeRange.endTime,
			timePartitionColumn,
		);
	}, [currentStream, timeRange.endTime, timeRange.startTime, timePartitionColumn]);

	return (
		<Modal
			opened={showQueryBuilder}
			onClose={onClose}
			size="auto"
			centered
			styles={{
				body: { padding: '0 0.8rem', height: '70vh', width: '50vw', justifyContent: 'center' },
				header: { padding: '1rem', paddingBottom: '0' },
			}}
			title={<ModalTitle title={getLabel(viewMode)} />}>
			<Stack style={{ padding: '1rem 0.5rem', height: '100%' }} gap={2}>
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
	const [custQuerySearchState, setLogsStore] = useLogsStore((store) => store.custQuerySearchState);
	const [{ startTime, endTime }] = useLogsStore((store) => store.timeRange);
	const { isQuerySearchActive, viewMode, showQueryBuilder, activeMode, savedFilterId } = custQuerySearchState;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [activeSavedFilters] = useAppStore((store) => store.activeSavedFilters);
	const openBuilderModal = useCallback(() => {
		setLogsStore((store) => toggleQueryBuilder(store));
	}, []);
	const [schema] = useStreamStore((store) => store.schema);
	const [streamInfo] = useStreamStore((store) => store.info);
	const [{ query, isSumbitDisabled }, setFilterStore] = useFilterStore((store) => store);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');

	useEffect(() => {
		if (schema) {
			setFilterStore((store) => setFields(store, schema));
		}
	}, [schema]);

	useEffect(() => {
		return setFilterStore(resetFilters);
	}, [currentStream]);

	const triggerRefetch = useCallback(
		(query: string, mode: 'filters' | 'sql', id?: string) => {
			const time_filter = id ? _.find(activeSavedFilters, (filter) => filter.filter_id === id)?.time_filter : null;
			setLogsStore((store) => applyCustomQuery(store, query, mode, id, time_filter));
		},
		[activeSavedFilters],
	);

	const onFiltersApply = useCallback(
		(opts?: { isUncontrolled?: boolean }) => {
			if (!currentStream) return;

			const { isUncontrolled } = opts || {};
			const { parsedQuery } = parseQuery(query, currentStream, { startTime, endTime, timePartitionColumn });
			setFilterStore((store) => storeAppliedQuery(store));
			triggerRefetch(parsedQuery, 'filters', isUncontrolled && savedFilterId ? savedFilterId : undefined);
		},
		[query, currentStream, savedFilterId, endTime, startTime, timePartitionColumn],
	);

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
		// -----------------------------------
		const ruleSets = query.rules.map((r) => r.rules);
		const allValues = ruleSets.flat().flatMap((rule) => {
			return noValueOperators.indexOf(rule.operator) !== -1 ? [null] : [rule.value];
		});
		const shouldSumbitDisabled = allValues.length === 0 || allValues.some((value) => value === '');
		if (isSumbitDisabled !== shouldSumbitDisabled) {
			setFilterStore((store) => toggleSubmitBtn(store, shouldSumbitDisabled));
		}
		// -----------------------------------

		// trigger query fetch if the rules were updated by the remove btn on pills
		// -----------------------------------
		if (!showQueryBuilder && (activeMode === 'filters' || savedFilterId)) {
			if (!shouldSumbitDisabled) {
				onFiltersApply({ isUncontrolled: true });
			} else {
				if (activeMode === 'filters') {
					onClear();
				}
			}
		}
		// -----------------------------------

		// trigger reset when no active rules are available
		if (isQuerySearchActive && allValues.length === 0 && activeMode !== 'sql') {
			onClear();
		}
	}, [query.rules, savedFilterId]);

	const onChangeCustQueryViewMode = useCallback((mode: 'sql' | 'filters') => {
		setLogsStore((store) => toggleCustQuerySearchViewMode(store, mode));
	}, []);

	const openSaveFiltersModal = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		setFilterStore((store) => toggleSaveFiltersModal(store, true));
	}, []);

	return (
		<Stack gap={0} style={{ flexDirection: 'row' }} className={classes.container}>
			<QuerierModal onSqlSearchApply={onSqlSearchApply} onFiltersApply={onFiltersApply} onClear={onClear} />
			<SaveFilterModal />
			<SavedFiltersModal />
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
						<Text style={{ fontSize: '0.65rem', fontWeight: 600 }}>{getLabel(viewMode)}</Text>
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
			<Stack
				style={{ width: '100%', justifyContent: 'space-between' }}
				onClick={openBuilderModal}
				className={classes.filterContainer}>
				<Stack>
					{viewMode === 'filters' && (activeMode === 'filters' ? <QueryPills /> : <FilterPlaceholder />)}
					{viewMode === 'sql' && (activeMode === 'sql' ? <AppliedSQLQuery /> : <SQLEditorPlaceholder />)}
				</Stack>
			</Stack>
			{isQuerySearchActive && (
				<Stack
					style={{
						padding: '0 0.25rem',
						height: '100%',
						justifyContent: 'center',
						width: '10%',
						maxWidth: 32,
						alignItems: 'center',
					}}
					onClick={openSaveFiltersModal}>
					{custQuerySearchState.savedFilterId ? (
						<Tooltip label="Edit this filter">
							<IconFilterEdit size="1rem" stroke={1.2} />
						</Tooltip>
					) : (
						<Tooltip label="Save this filter">
							<IconFilterPlus size="1rem" stroke={1.2} />
						</Tooltip>
					)}
				</Stack>
			)}
		</Stack>
	);
};

export default Querier;
