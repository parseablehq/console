import { Group, Menu, Modal, Stack, px } from '@mantine/core';
import { useLogsPageContext } from './context';
import { ToggleButton } from '@/components/Button/ToggleButton';
import { IconChevronDown, IconCodeCircle, IconFilter } from '@tabler/icons-react';
import classes from './styles/Querier.module.css';
import { Text } from '@mantine/core';
import { FilterQueryBuilder, QueryPills } from './FilterQueryBuilder';
import { AppliedSQLQuery } from './QueryEditor';
import QueryCodeEditor from './QueryCodeEditor';

const getLabel = (mode: string | null) => {
	return mode === 'filters' ? 'Filters' : mode === 'sql' ? 'SQL' : '';
};

const FilterPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to add filter
		</Group>
	);
};

const SQLEditorPlaceholder = () => {
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconCodeCircle size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to write query
		</Group>
	);
};

const ModalTitle = ({ title }: { title: string }) => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>{title}</Text>;
};

const QuerierModal = () => {
	const {
		methods: { toggleBuilderModal },
		state: {
			custQuerySearchState: { viewMode },
			builderModalOpen,
		},
	} = useLogsPageContext();

	return (
		<Modal
			opened={builderModalOpen}
			onClose={toggleBuilderModal}
			size="auto"
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle title={getLabel(viewMode)} />}>
			<Stack style={{ width: '820px', padding: '1rem', height: '100%' }} gap={0}>
				{viewMode === 'filters' ? <FilterQueryBuilder /> : <QueryCodeEditor />}
			</Stack>
		</Modal>
	);
};

const Querier = () => {
	const {
		methods: { toggleCustQuerySearchMode, toggleBuilderModal },
		state: {
			custQuerySearchState: { isQuerySearchActive, mode, viewMode },
		},
	} = useLogsPageContext();
	const isFiltersApplied = mode === 'filters' && isQuerySearchActive;
	const isSqlSearchActive = mode === 'sql' && isQuerySearchActive;
	return (
		<Stack gap={0} className={classes.container}>
			<QuerierModal />
			<Menu position="bottom">
				<Menu.Target>
					<div style={{ width: 'fit-content' }}>
						<ToggleButton
							onClick={() => {}}
							toggled={false}
							renderIcon={() => <IconChevronDown size={px('1.2rem')} stroke={1.5} />}
							label={getLabel(viewMode)}
							iconPosition="right"
							customClassName={classes.modeButton}
						/>
					</div>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item
						onClick={() => toggleCustQuerySearchMode('filters')}
						style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
						Filters
					</Menu.Item>
					<Menu.Item
						onClick={() => toggleCustQuerySearchMode('sql')}
						style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
						SQL
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<Stack style={{ width: '100%' }} gap={0} onClick={toggleBuilderModal} className={classes.filterContainer}>
				{viewMode === 'filters' && (isFiltersApplied ? <QueryPills /> : <FilterPlaceholder />)}
				{viewMode === 'sql' && (isSqlSearchActive ? <AppliedSQLQuery /> : <SQLEditorPlaceholder />)}
			</Stack>
		</Stack>
	);
};

export default Querier;
