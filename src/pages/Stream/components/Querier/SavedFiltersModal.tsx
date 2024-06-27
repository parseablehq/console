import { Box, Button, Modal, px, Stack, Text, Loader } from '@mantine/core';
import { filterStoreReducers, QueryType, useFilterStore } from '../../providers/FilterProvider';
import { SavedFilterType } from '@/@types/parseable/api/savedFilters';
import { useCallback, useEffect, useState } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { CodeHighlight } from '@mantine/code-highlight';
import _ from 'lodash';
import dayjs from 'dayjs';
import { IconClock, IconEye, IconEyeOff, IconTrash, IconX } from '@tabler/icons-react';
import IconButton from '@/components/Button/IconButton';
import classes from './styles/SavedFiltersModalStyles.module.css';
import { EmptySimple } from '@/components/Empty';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import useSavedFiltersQuery from '@/hooks/useSavedFilters';

const { toggleSavedFiltersModal, resetFilters, parseQuery, applySavedFilters } = filterStoreReducers;
const { applyCustomQuery, updateSavedFilterId } = logsStoreReducers;

const renderDeleteIcon = () => <IconTrash size={px('1rem')} stroke={1.5} />;
const renderCloseIcon = () => <IconX size={px('1rem')} stroke={1.5} />;
const renderEyeOffIcon = () => <IconEyeOff size={px('1rem')} stroke={1.5} />;
const renderEyeIcon = () => <IconEye size={px('1rem')} stroke={1.5} />;

const DeleteButton = (props: { onClick: () => void }) => {
	return <IconButton renderIcon={renderDeleteIcon} size={38} onClick={props.onClick} />;
};

const VisiblityToggleButton = (props: { showQuery: boolean; onClick: () => void }) => {
	return (
		<IconButton renderIcon={props.showQuery ? renderEyeOffIcon : renderEyeIcon} size={38} onClick={props.onClick} />
	);
};

const getTimeRangeLabel = (startTime: string, endTime: string) => {
	return `${dayjs(startTime).format('hh:mm A DD MMM YY')} to ${dayjs(endTime).format('hh:mm A DD MMM YY')}`;
};

const SavedFilterItem = (props: {
	item: SavedFilterType;
	onSqlSearchApply: (query: string, id: string) => void;
	onFilterBuilderQueryApply: (query: QueryType, id: string) => void;
}) => {
	const {
		item: { filter_name, time_filter, query, filter_id, stream_name },
	} = props;
	const hasTimeRange = _.isString(time_filter.from) && _.isString(time_filter.to);
	const [showQuery, setShowQuery] = useState<boolean>(false);
	const [showDeletePropmt, setShowDeletePrompt] = useState<boolean>(false);
	const { deleteSavedFilterMutation } = useSavedFiltersQuery();

	const toggleShowQuery = useCallback(() => {
		return setShowQuery((prev) => !prev);
	}, []);

	const handleDelete = useCallback(() => {
		if (!showDeletePropmt) {
			return setShowDeletePrompt(true);
		}
		deleteSavedFilterMutation({ filter_id });
	}, [showDeletePropmt]);

	const onApplyFilters = useCallback(() => {
		if (_.isString(query.filter_query)) {
			props.onSqlSearchApply(query.filter_query, filter_id);
		} else if (query.filter_builder) {
			props.onFilterBuilderQueryApply(query.filter_builder, filter_id);
		}
	}, []);

	return (
		<Stack className={classes.filterItemContainer} style={{ paddingBottom: '0.8rem' }}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Stack gap={6} style={{ width: '60%' }}>
					<Text style={{ fontSize: '0.8rem' }}>{filter_name}</Text>
					<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={6}>
						<IconClock size="0.9rem" stroke={1.4} color="#868e96" />
						<Text style={{ fontSize: '0.7rem' }} c="gray.6">
							{hasTimeRange && time_filter.from && time_filter.to
								? getTimeRangeLabel(time_filter.from, time_filter.to)
								: 'No selected time range'}
						</Text>
					</Stack>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', width: '40%', justifyContent: 'flex-end' }}>
					{showDeletePropmt ? (
						<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
							<Box>
								<Button leftSection={renderDeleteIcon()} variant="outline">
									Confirm
								</Button>
							</Box>
							<Box>
								<Button leftSection={renderCloseIcon()} onClick={() => setShowDeletePrompt(false)}>
									Cancel
								</Button>
							</Box>
						</Stack>
					) : (
						<>
							<VisiblityToggleButton showQuery={showQuery} onClick={toggleShowQuery} />
							<DeleteButton onClick={handleDelete} />
							<Box>
								<Button variant="outline" onClick={onApplyFilters}>
									Apply
								</Button>
							</Box>
						</>
					)}
				</Stack>
			</Stack>
			{showQuery && (
				<Stack>
					<CodeHighlight
						code={
							_.isString(query.filter_query)
								? query.filter_query
								: query.filter_builder
								? parseQuery(query.filter_builder, stream_name).parsedQuery
								: ''
						}
						language="sql"
						withCopyButton={false}
						styles={{
							code: {
								fontSize: '0.72rem',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-word',
							},
						}}
					/>
				</Stack>
			)}
		</Stack>
	);
};

const SavedFiltersModal = () => {
	const [isSavedFiltersModalOpen, setFilterStore] = useFilterStore((store) => store.isSavedFiltersModalOpen);
	const [, setLogsStore] = useLogsStore((_store) => null);
	const [savedFilters] = useAppStore((store) => store.savedFilters);
	const [activeSavedFilters] = useAppStore((store) => store.activeSavedFilters);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const { isLoading, refetch, isError } = useSavedFiltersQuery();
	const onSqlSearchApply = useCallback((query: string, id: string) => {
		setFilterStore((store) => resetFilters(store));
		setLogsStore((store) => applyCustomQuery(store, query, 'sql', id));
	}, []);

	const onFilterBuilderQueryApply = useCallback(
		(query: QueryType, id: string) => {
			setFilterStore((store) => resetFilters(store));
			setLogsStore((store) => updateSavedFilterId(store, id));
			setFilterStore((store) => applySavedFilters(store, query));
		},
		[currentStream],
	);

	useEffect(() => {
		if (savedFilters === null) {
			refetch();
		}
	}, [savedFilters]);

	const closeModal = useCallback(() => {
		setFilterStore((store) => toggleSavedFiltersModal(store, false));
	}, []);

	const hasNoSavedFilters = _.isEmpty(activeSavedFilters) || _.isNil(activeSavedFilters) || isError;
	return (
		<Modal
			opened={isSavedFiltersModalOpen}
			onClose={closeModal}
			size="auto"
			centered
			styles={{ body: { padding: '0 1.2rem 1.2rem 1.2rem' }, header: { padding: '1rem', paddingBottom: '0.4rem' } }}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Saved Filters</Text>}>
			<Stack w={700} mih={400} gap={14} style={{ paddingTop: hasNoSavedFilters ? 0 : '0.8rem' }}>
				{hasNoSavedFilters ? (
					<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
						{isLoading ? (
							<Loader />
						) : (
							<>
								<EmptySimple height={60} width={60} />
								<Text style={{ fontSize: '0.75rem' }} c="gray.5">
									No items to display
								</Text>
							</>
						)}
					</Stack>
				) : (
					<>
						{_.map(activeSavedFilters, (filterItem) => {
							return (
								<SavedFilterItem
									item={filterItem}
									key={filterItem.filter_id}
									onSqlSearchApply={onSqlSearchApply}
									onFilterBuilderQueryApply={onFilterBuilderQueryApply}
								/>
							);
						})}
					</>
				)}
			</Stack>
		</Modal>
	);
};

export default SavedFiltersModal;
