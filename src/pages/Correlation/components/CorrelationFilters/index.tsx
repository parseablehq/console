import { Group, Modal, Stack, Tabs } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import classes from '../../styles/CorrelationFilters.module.css';
import { Text } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import { QueryPills, FilterQueryBuilder } from '@/pages/Stream/components/Querier/FilterQueryBuilder';
import { defaultCustSQLQuery } from '@/pages/Stream/components/Querier/QueryCodeEditor';
import { filterStoreReducers, useFilterStore, noValueOperators } from '@/pages/Stream/providers/FilterProvider';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import { useStreamStore } from '@/pages/Stream/providers/StreamProvider';

const { setFields, parseQuery, storeAppliedQuery, resetFilters, toggleSubmitBtn } = filterStoreReducers;
const { toggleQueryBuilder, toggleCustQuerySearchViewMode, applyCustomQuery, resetCustQuerySearchState } =
	logsStoreReducers;

const FilterPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'0.8rem'} stroke={1.8} style={{ marginRight: 6 }} />
			<Text style={{ fontSize: '0.65rem', fontWeight: 600 }}>Click to add filter</Text>
		</Group>
	);
};

const ModalTitle = ({ title }: { title: string }) => {
	const [, setLogsStore] = useLogsStore((store) => store.custQuerySearchState);
	const onChangeCustQueryViewMode = useCallback((mode: 'filters') => {
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
			</Tabs.List>
		</Tabs>
	);
};

const QuerierModal = (props: { onClear: () => void; onFiltersApply: () => void }) => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [queryEngine] = useAppStore((store) => store.instanceConfig?.queryEngine);
	const [{ showQueryBuilder }, setLogsStore] = useLogsStore((store) => store.custQuerySearchState);
	const [streamInfo] = useStreamStore((store) => store.info);
	const [timeRange] = useLogsStore((store) => store.timeRange);
	const timePartitionColumn = _.get(streamInfo, 'time_partition', 'p_timestamp');
	const onClose = useCallback(() => {
		setLogsStore((store) => toggleQueryBuilder(store, false));
	}, []);
	const queryCodeEditorRef = useRef<any>(''); // to store input value even after the editor unmounts

	useEffect(() => {
		queryCodeEditorRef.current = defaultCustSQLQuery(
			queryEngine,
			currentStream,
			timeRange.startTime,
			timeRange.endTime,
			timePartitionColumn,
		);
	}, [queryEngine, currentStream, timeRange.endTime, timeRange.startTime, timePartitionColumn]);

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
			title={<ModalTitle title="Filters" />}>
			<Stack style={{ padding: '1rem 0.5rem', height: '100%' }} gap={2}>
				<FilterQueryBuilder onClear={props.onClear} onApply={props.onFiltersApply} />
			</Stack>
		</Modal>
	);
};

const CorrelationFilters = () => {
	const [custQuerySearchState, setLogsStore] = useLogsStore((store) => store.custQuerySearchState);
	const [{ startTime, endTime }] = useLogsStore((store) => store.timeRange);
	const { isQuerySearchActive, viewMode, showQueryBuilder, activeMode, savedFilterId } = custQuerySearchState;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [queryEngine] = useAppStore((store) => store.instanceConfig?.queryEngine);
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
		(query: string, mode: 'filters', id?: string) => {
			const time_filter = id ? _.find(activeSavedFilters, (filter) => filter.filter_id === id)?.time_filter : null;
			setLogsStore((store) => applyCustomQuery(store, query, mode, id, time_filter));
		},
		[activeSavedFilters],
	);

	const onFiltersApply = useCallback(
		(opts?: { isUncontrolled?: boolean }) => {
			if (!currentStream) return;

			const { isUncontrolled } = opts || {};
			const { parsedQuery } = parseQuery(queryEngine, query, currentStream, {
				startTime,
				endTime,
				timePartitionColumn,
			});
			setFilterStore((store) => storeAppliedQuery(store));
			triggerRefetch(parsedQuery, 'filters', isUncontrolled && savedFilterId ? savedFilterId : undefined);
		},
		[query, currentStream, savedFilterId, endTime, startTime, timePartitionColumn],
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
		if (isQuerySearchActive && allValues.length === 0) {
			onClear();
		}
	}, [query.rules, savedFilterId]);

	return (
		<Stack gap={0} style={{ flexDirection: 'row' }} className={classes.container}>
			<QuerierModal onFiltersApply={onFiltersApply} onClear={onClear} />

			<Stack
				gap={0}
				style={{
					borderRight: '1px solid #e9ecef',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 1rem',
				}}>
				<Text style={{ fontSize: '0.65rem', fontWeight: 600 }}>Filters</Text>
			</Stack>

			<Stack
				style={{ width: '100%', justifyContent: 'space-between' }}
				onClick={openBuilderModal}
				className={classes.filterContainer}>
				<Stack>{viewMode === 'filters' && (activeMode === 'filters' ? <QueryPills /> : <FilterPlaceholder />)}</Stack>
			</Stack>
		</Stack>
	);
};

export default CorrelationFilters;
