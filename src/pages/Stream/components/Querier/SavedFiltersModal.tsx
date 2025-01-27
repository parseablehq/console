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
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import useSavedFiltersQuery from '@/hooks/useSavedFilters';
import { generateQueryBuilderASTFromSQL } from '../../utils';
import { useLocation } from 'react-router-dom';

const { toggleSavedFiltersModal, resetFilters, parseQuery, applySavedFilters, setAppliedFilterQuery } =
	filterStoreReducers;
const { applyCustomQuery, updateSavedFilterId, getCleanStoreForRefetch } = logsStoreReducers;
const { syncTimeRange, setTimeRange, applyQueryWithResetTime } = appStoreReducers;

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
	onSqlSearchApply: (query: string, id: string, time_filter: null | { from: string; to: string }) => void;
	onFilterBuilderQueryApply: (query: QueryType, id: string) => void;
	currentStream: string;
	savedFilterId: string | null;
	isStoredAndCurrentTimeRangeAreSame: (from: string, to: string) => boolean;
	hardRefresh: () => void;
	changeTimerange: (from: string, end: string) => void;
}) => {
	const {
		item: { filter_name, time_filter, query, filter_id, stream_name },
		savedFilterId,
		isStoredAndCurrentTimeRangeAreSame,
		hardRefresh,
		changeTimerange,
	} = props;
	const [showQuery, setShowQuery] = useState<boolean>(false);
	const [showDeletePropmt, setShowDeletePrompt] = useState<boolean>(false);
	const { deleteSavedFilterMutation, isDeleting, isRefetching } = useSavedFiltersQuery();

	const location = useLocation();
	const [, setFilterStore] = useFilterStore(() => null);

	const toggleShowQuery = useCallback(() => {
		return setShowQuery((prev) => !prev);
	}, []);

	const handleDelete = useCallback(() => {
		if (!showDeletePropmt) {
			return setShowDeletePrompt(true);
		}
		deleteSavedFilterMutation({ filter_id });
	}, [showDeletePropmt]);

	const handleTimeFilter = useCallback(() => {
		if (time_filter === null || (time_filter && isStoredAndCurrentTimeRangeAreSame(time_filter.from, time_filter.to))) {
			hardRefresh();
		} else {
			changeTimerange(time_filter.from, time_filter.to);
		}
	}, [time_filter, isStoredAndCurrentTimeRangeAreSame, hardRefresh, changeTimerange]);

	const onApplyFilters = useCallback(() => {
		if (location.pathname.includes('dashboard')) {
			if (query.filter_query) {
				setFilterStore((store) => setAppliedFilterQuery(store, query.filter_query));
			} else if (query.filter_builder) {
				setFilterStore((store) =>
					setAppliedFilterQuery(store, parseQuery(query.filter_builder as QueryType, stream_name).parsedQuery),
				);
			}
			setFilterStore((store) => toggleSavedFiltersModal(store, false));
		} else {
			if (query.filter_query) {
				if (query.filter_type === 'sql') {
					props.onSqlSearchApply(query.filter_query, filter_id, time_filter);
				} else {
					if (filter_id !== savedFilterId) {
						props.onFilterBuilderQueryApply(generateQueryBuilderASTFromSQL(query.filter_query), filter_id);
					} else {
						handleTimeFilter();
					}
				}
			} else if (query.filter_builder) {
				if (filter_id !== savedFilterId) {
					props.onFilterBuilderQueryApply(query.filter_builder, filter_id);
				} else {
					handleTimeFilter();
				}
			}
		}
	}, [savedFilterId, isStoredAndCurrentTimeRangeAreSame, hardRefresh, changeTimerange]);

	return (
		<Stack className={classes.filterItemContainer} style={{ paddingBottom: '0.8rem' }}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Stack gap={6} style={{ width: '60%' }}>
					<Text style={{ fontSize: '0.8rem' }}>{filter_name}</Text>
					<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={6}>
						<IconClock size="0.9rem" stroke={1.4} color="#868e96" />
						<Text style={{ fontSize: '0.7rem' }} c="gray.6">
							{time_filter && time_filter.from && time_filter.to
								? getTimeRangeLabel(time_filter.from, time_filter.to)
								: 'No selected time range'}
						</Text>
					</Stack>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', width: '40%', justifyContent: 'flex-end' }}>
					{showDeletePropmt ? (
						isDeleting || isRefetching ? (
							<Stack style={{ flex: 1, alignItems: 'center' }}>
								<Loader size="md" />
							</Stack>
						) : (
							<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
								<Box>
									<Button leftSection={renderDeleteIcon()} onClick={handleDelete} variant="outline">
										Confirm
									</Button>
								</Box>
								<Box>
									<Button leftSection={renderCloseIcon()} onClick={() => setShowDeletePrompt(false)}>
										Cancel
									</Button>
								</Box>
							</Stack>
						)
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
	const [savedFilterId, setLogsStore] = useLogsStore((store) => store.custQuerySearchState.savedFilterId);
	const [{ startTime, endTime }, setAppStore] = useAppStore((store) => store.timeRange);
	const [savedFilters] = useAppStore((store) => store.savedFilters);
	const [activeSavedFilters] = useAppStore((store) => store.activeSavedFilters);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const { isLoading, refetch, isError } = useSavedFiltersQuery();
	const onSqlSearchApply = useCallback(
		(query: string, id: string, time_filter: null | { from: string; to: string }) => {
			setFilterStore((store) => resetFilters(store));
			setAppStore((store) => applyQueryWithResetTime(store, time_filter));
			setLogsStore((store) => applyCustomQuery(store, query, 'sql', id));
		},
		[],
	);
	const startTimeString = startTime.toISOString();
	const endTimeString = endTime.toISOString();

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
	const isStoredAndCurrentTimeRangeAreSame = useCallback(
		(from: string, to: string) => {
			return from === startTimeString && to === endTimeString;
		},
		[startTimeString, endTimeString],
	);

	const hardRefresh = useCallback(() => {
		setAppStore((store) => syncTimeRange(store));
		setLogsStore((store) => getCleanStoreForRefetch(store));
		closeModal();
	}, []);

	const changeTimerange = useCallback((from: string, end: string) => {
		setLogsStore((store) => getCleanStoreForRefetch(store));
		setAppStore((store) => setTimeRange(store, { type: 'custom', startTime: dayjs(from), endTime: dayjs(end) }));
		closeModal();
	}, []);

	useEffect(() => {
		const handleKeyPress = (event: { key: string }) => {
			if (event.key === 'Escape') {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

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
									currentStream={currentStream || ''}
									savedFilterId={savedFilterId}
									isStoredAndCurrentTimeRangeAreSame={isStoredAndCurrentTimeRangeAreSame}
									hardRefresh={hardRefresh}
									changeTimerange={changeTimerange}
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
