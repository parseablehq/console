import { Tbody, Thead } from '@/components/Table';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import {
	Box,
	Center,
	Checkbox,
	Menu,
	ScrollArea,
	Table,
	px,
	ActionIcon,
	Text,
	Flex,
	Button,
	Pagination,
	Loader,
	Group,
	Stack,
	Tooltip,
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { LOG_TABLE_PER_PAGE, useLogsPageContext, LOAD_LIMIT as loadLimit, LOAD_LIMIT } from './logsContextProvider';
import LogRow from './LogRow';
import useMountedState from '@/hooks/useMountedState';
import { IconSelector, IconGripVertical, IconPin, IconPinFilled, IconSettings } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EmptyBox from '@/components/Empty';
import { RetryBtn } from '@/components/Button/Retry';
import Column from './Column';
import FilterPills from './FilterPills';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import dayjs from 'dayjs';
import { SortOrder } from '@/@types/parseable/api/query';
import { usePagination } from '@mantine/hooks';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import tableStyles from './styles/Logs.module.css';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT, LOGS_SECONDARY_TOOLBAR_HEIGHT, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { useQueryResult } from '@/hooks/useQueryResult';
import { HumanizeNumber } from '@/utils/formatBytes';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const skipFields = ['p_metadata', 'p_tags'];

const {togglePinnedColumns, toggleDisabledColumns, setPerPage, setCurrentPage, setCurrentOffset, setPageAndPageData} = logsStoreReducers;

const makeHeadersFromSchema = (schema: LogStreamSchemaData | null): string[] => {
	if (schema) {
		const { fields } = schema;
		return fields.map((field) => field.name);
	} else {
		return [];
	}
};

const makeHeadersfromData = (schema: LogStreamSchemaData | null, custSearchQuery: string | null): string[] => {
	const allColumns = makeHeadersFromSchema(schema);
	if (custSearchQuery === null) return allColumns;

	const selectClause = custSearchQuery.match(/SELECT(.*?)FROM/i)?.[1];
	if (!selectClause || selectClause.includes('*')) return allColumns;

	const commonColumns = allColumns.filter((column) => selectClause.includes(column));
	return commonColumns;
};

type TotalLogsCountProps = {
	totalCount: number | null;
	loadedCount: number | null;
};

const TotalLogsCount = () => {
	const [{ displayedCount, totalCount }] = useLogsStore((store) => store.tableOpts);
	if (typeof totalCount !== 'number' || typeof displayedCount !== 'number') return <Stack />;

	const renderTotalCount = useCallback(
		() => (
			<Tooltip label={totalCount}>
				<Text>{HumanizeNumber(totalCount)}</Text>
			</Tooltip>
		),
		[totalCount],
	);
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }} gap={6}>
			<Text>{`Showing ${displayedCount < LOAD_LIMIT ? displayedCount : LOAD_LIMIT} out of`}</Text>
			{renderTotalCount()}
		</Stack>
	);
};

const TableContainer = (props: { children: ReactNode }) => {
	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;

	return (
		<Box
			className={tableStyles.container}
			style={{
				maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
			}}>
			{props.children}
		</Box>
	);
};

const PinnedColumns = (props) => {
	const { containerRefs } = props;
	const { leftSectionRef, rightSectionRef, activeSectionRef, pinnedContianerRef } = containerRefs;

	const [{ pinnedColumns }] = useLogsStore((store) => store.tableOpts);
	const [pinnedColumnsWidth, setPinnedColumnsWidth] = useMountedState(0);

	useEffect(() => {
		if (
			pinnedContianerRef.current?.offsetWidth &&
			pinnedContianerRef.current?.clientWidth < 500 &&
			pinnedColumns.length > 0
		) {
			setPinnedColumnsWidth(pinnedContianerRef.current?.clientWidth);
		} else if (
			pinnedContianerRef.current?.offsetWidth &&
			pinnedContianerRef.current?.clientWidth > 500 &&
			pinnedColumns.length > 0
		) {
			setPinnedColumnsWidth(500);
		} else {
			setPinnedColumnsWidth(0);
		}
	}, [pinnedContianerRef, pinnedColumns]);


	{/* {pinnedColumnsWidth > 0 && <Box style={{ height: '100%', borderLeft: '1px solid #ccc' }} />} */}

	return (
		<ScrollArea
			w={`${pinnedColumnsWidth}px`}
			className={tableStyles.pinnedScrollView}
			styles={() => ({
				scrollbar: {
					'&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
						display: 'none',
					},
				},
			})}
			onMouseEnter={() => {
				activeSectionRef.current = 'left';
			}}
			viewportRef={leftSectionRef}
			onScrollPositionChange={({ y }) => {
				if (activeSectionRef.current === 'right') return;
				rightSectionRef.current!.scrollTop = y;
			}}>
			<Box className={tableStyles.pinnedTableContainer} ref={pinnedContianerRef}>
				<Table className={tableStyles.tableStyle}>
					<Thead className={tableStyles.theadStylePinned}>
						<TableHeader isPinned />
					</Thead>
					<Tbody>
						<LogRow isPinned />
					</Tbody>
				</Table>
			</Box>
		</ScrollArea>
	);
};

const Columns = (props) => {
	const {
		reorderSchemaFields,
		resetColumns,
		containerRefs
	} = props;
	const { leftSectionRef, rightSectionRef, activeSectionRef } = containerRefs;
	return (
		<ScrollArea
			onMouseEnter={() => {
				activeSectionRef.current = 'right';
			}}
			viewportRef={rightSectionRef}
			onScrollPositionChange={({ y }) => {
				if (activeSectionRef.current === 'left') return;
				leftSectionRef.current!.scrollTop = y;
			}}>
			<Box className={tableStyles.tableContainer}>
				<Table className={tableStyles.tableStyle}>
					<Thead className={tableStyles.theadStyle}>
						<TableHeader />
						<ThColumnMenu
							reorderColumn={reorderSchemaFields}
							resetColumns={resetColumns}
						/>
					</Thead>
					<Tbody>
						<LogRow rowArrows />
					</Tbody>
				</Table>
			</Box>
		</ScrollArea>
	);
};

const ErrorView = (props) => {
	const { message, onRetry } = props;
	return (
		<Center className={tableStyles.errorContainer}>
			<Text c="red.8" style={{ fontWeight: 400 }}>
				{message || 'Error'}
			</Text>
			{(logsError || logStreamSchemaError) && <RetryBtn onClick={onRetry} mt="md" />}
		</Center>
	);
};

const LoadingView = () => {
	return (
		<Stack w="100%" align="center" h="100%" style={{ alignItems: 'center', justifyContent: 'center' }}>
			<Loader variant="dots" />
		</Stack>
	);
};

const Footer = (props) => {
	const [tableOpts, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const { totalPages, currentOffset, currentPage, perPage } = tableOpts;
	console.log(tableOpts)
	const onPageChange = useCallback((page) => {
		setLogsStore((store) => setPageAndPageData(store, page));
	}, []);
	const pagination = usePagination({ total: totalPages ?? 1, initialPage: 1, onChange: onPageChange });
	const onChangeOffset = useCallback(
		(key: 'prev' | 'next') => {
			if (key === 'prev') {
				const targetOffset = currentOffset - 9000;
				if (currentOffset < 0) return;

				if (targetOffset === 0 && currentOffset > 0) {
					// hack to initiate fetch
					setLogsStore((store) => setCurrentPage(store, 0));
				}
				setLogsStore((store) => setCurrentOffset(store, targetOffset));
			} else {
				// should limit with total count ?
				setLogsStore((store) => setCurrentOffset(store, currentOffset + 9000));
			}
		},
		[currentOffset],
	);

	return (
		<Box className={tableStyles.footerContainer}>
			<Stack w="100%" justify="center" align="flex-start">
				<TotalLogsCount />
			</Stack>
			<Stack w="100%" justify="center">
				{true ? (
					<Pagination.Root
						total={totalPages}
						value={currentPage}
						onChange={(page) => {
							pagination.setPage(page);
						}}>
						<Group gap={5} justify="center">
							<Pagination.First
								onClick={() => {
									currentOffset !== 0 && onChangeOffset('prev');
								}}
								disabled={currentOffset === 0}
							/>
							<Pagination.Previous />
							{pagination.range.map((page) => {
								if (page === 'dots') {
									return <Pagination.Dots key={page} />;
								} else {
									return (
										<Pagination.Control
											value={page}
											key={page}
											active={currentPage === page}
											onClick={() => {
												pagination.setPage(page);
											}}>
											{perPage ? page + currentOffset / perPage ?? 1 : page}
										</Pagination.Control>
									);
								}
							})}
							<Pagination.Next />
							<Pagination.Last
								onClick={() => {
									onChangeOffset('next');
								}}
								disabled={false} // do not rmv
							/>
						</Group>
					</Pagination.Root>
				) : null}
			</Stack>
			<Stack w="100%" align="flex-end">
				<LimitControl />
			</Stack>
		</Box>
	);
};

const TableHeader = (props) => {
	const [{headers, disabledColumns, pinnedColumns}] = useLogsStore(store => store.tableOpts);

	if (headers.length > 0) {
		return headers
			.filter((tableHeader) => !disabledColumns.includes(tableHeader) && !skipFields.includes(tableHeader))
			.filter((tableHeader) =>
				props.isPinned ? pinnedColumns.includes(tableHeader) : !pinnedColumns.includes(tableHeader),
			)
			.map((tableHeader) => {
				return (
					<Column
						key={tableHeader}
						columnName={tableHeader}
						appliedFilter={() => {}}
						applyFilter={() => {}}
						getColumnFilters={() => {}}
						setSorting={() => {}}
						fieldSortOrder={() => {}}
					/>
				);
			});
	}

	return null;
};

const LogTable2 = () =>{
	const [containerRefs, _setContainerRefs] = useState({
		activeSectionRef: useRef<'left' | 'right'>('left'),
		leftSectionRef: useRef<HTMLDivElement>(null),
		rightSectionRef: useRef<HTMLDivElement>(null),
		pinnedContianerRef: useRef<HTMLDivElement>(null),
	});

	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;

	const { getDataSchema, loading: schemaLoading, error: logStreamSchemaError } = useGetLogStreamSchema();
	const { getQueryData, loading: logsLoading, error: logsError, fetchCount } = useQueryLogs();

	const { fetchQueryMutation } = useQueryResult();
	const [currentPage] = useLogsStore(store => store.tableOpts.currentPage)
	const [currentOffset] = useLogsStore(store => store.tableOpts.currentOffset)

	useEffect(() => {
		getDataSchema();
	}, []);

	useEffect(() => {
		if (currentPage === 0) {
			getQueryData();
			fetchCount();
		} else if (currentOffset !== 0) {
			getQueryData();
		}
	}, [currentPage, currentOffset]);

	const [pageData] = useLogsStore(store => store.tableOpts.pageData)
	const hasContentLoaded = !schemaLoading && !logsLoading;
	const errorMessage = logStreamSchemaError || logsError;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	console.log(pageData)
	return (
		<TableContainer>
			<FilterPills />
			{!errorMessage ? (
				hasContentLoaded ? (
					<Box className={tableStyles.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={tableStyles.innerContainer}
							style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
							<PinnedColumns containerRefs={containerRefs} />
							<Columns
								reorderSchemaFields={() => {}} // check
								resetColumns={() => {}} // check
								containerRefs={containerRefs}
							/>
						</Box>
					</Box>
				) : hasNoData ? ( // check
					<EmptyBox message="No Data Available" />
				) : (
					<LoadingView />
				)
			) : (
				<ErrorView message={errorMessage} onRetry={() => {}} /> // check
			)}
			<Footer />
		</TableContainer>
	);
}

const LogTable: FC = () => {
	const {
		state: {
			subLogStreamError,
			subLogStreamSchema,
			custQuerySearchState: { isQuerySearchActive, custSearchQuery },
			pageOffset,
		},
		methods: { setPageOffset, resetQuerySearch },
	} = useLogsPageContext();
	const {
		state: { subLogSearch, subLogQuery, subRefreshInterval, subLogSelectedTimeRange, maximized },
	} = useHeaderContext();
	const [refreshInterval, setRefreshInterval] = useMountedState<number | null>(null);
	const [logStreamError, setLogStreamError] = useMountedState<string | null>(null);
	const [columnToggles, setColumnToggles] = useMountedState<Map<string, boolean>>(new Map());
	const [containerRefs, _setContainerRefs] = useState({
		activeSectionRef: useRef<'left' | 'right'>('left'),
		leftSectionRef: useRef<HTMLDivElement>(null),
		rightSectionRef: useRef<HTMLDivElement>(null),
		pinnedContianerRef: useRef<HTMLDivElement>(null),
	});
	const {
		data: logsSchema,
		getDataSchema,
		reorderSchemaFields,
		resetData: resetStreamData,
		loading,
		error: logStreamSchemaError,
	} = useGetLogStreamSchema();

	const {
		data: logs,
		getColumnFilters,
		pageLogData,
		setQuerySearch,
		getQueryData,
		goToPage,
		setPageLimit,
		loading: logsLoading,
		error: logsError,
		resetData: resetLogsData,
		sort,
	} = useQueryLogs();

	const tableHeaders = isQuerySearchActive
		? makeHeadersfromData(logsSchema, custSearchQuery)
		: makeHeadersFromSchema(logsSchema);
	const appliedFilter = (key: string) => {
		return subLogSearch.get().filters[key] ?? [];
	};

	
	const currentStreamName = subLogQuery.get().streamName;
	const startTime = subLogQuery.get().startTime;
	const endTime = subLogQuery.get().endTime;
	const { fetchQueryMutation } = useQueryResult();
	const fetchCount = useCallback(() => {
		const queryContext = subLogQuery.get();
		const defaultQuery = `select count(*) as count from ${currentStreamName}`;
		const query = isQuerySearchActive
			? custSearchQuery.replace(/SELECT[\s\S]*?FROM/i, 'SELECT COUNT(*) as count FROM')
			: defaultQuery;
		if (queryContext && query?.length > 0) {
			const logsQuery = {
				streamName: queryContext.streamName,
				startTime: startTime,
				endTime: endTime,
				access: [],
			};
			fetchQueryMutation.mutate({
				logsQuery,
				query,
			});
		}
	}, [currentStreamName, isQuerySearchActive, custSearchQuery, startTime, endTime]);

	useEffect(() => {
		resetQuerySearch();
	}, [currentStreamName]);

	const applyFilter = (key: string, value: string[]) => {
		subLogSearch.set((state) => {
			state.filters[key] = value;
			if (!state.filters[key].length) {
				delete state.filters[key];
			}
		});
	};

	const isColumnActive = useCallback(
		(columnName: string) => {
			if (!columnToggles.has(columnName)) return true;

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return columnToggles.get(columnName)!;
		},
		[columnToggles],
	);

	const toggleColumn = (columnName: string, value: boolean) => {
		setColumnToggles(new Map(columnToggles.set(columnName, value)));
	};

	// Function to get a setter to set sort order on a given field
	const sortingSetter = (columName: string) => {
		return (order: SortOrder | null) => {
			setQuerySearch((prev) => {
				const sort = {
					key: 'p_timestamp',
					order: SortOrder.DESCENDING,
				};
				if (order !== null) {
					sort.key = columName;
					sort.order = order;
				}

				return {
					...prev,
					sort,
				};
			});
		};
	};

	const onRetry = () => {
		const query = subLogQuery.get();
		resetStreamData();
		resetLogsData();
		// resetColumns();
		setPageOffset(0);

		if (query) {
			getQueryData({
				streamName: query.streamName,
				startTime: query.startTime,
				endTime: query.endTime,
				limit: loadLimit,
				pageOffset: 0,
			});
			getDataSchema();
		}
	};

	useEffect(() => {
		if (subLogQuery.get()) {
			const query = subLogQuery.get();
			// resetColumns();
			setPageOffset(0);
			resetStreamData();
			resetLogsData();
			if (query) {
				getQueryData({
					streamName: query.streamName,
					startTime: query.startTime,
					endTime: query.endTime,
					limit: loadLimit,
					pageOffset: 0,
				});
				getDataSchema();
			}
		}
	}, [custSearchQuery]);

	useEffect(() => {
		if (pageOffset === 0 && subLogQuery.get()) {
			fetchCount();
		}
	}, [currentStreamName, isQuerySearchActive, custSearchQuery, startTime, endTime]);

	useEffect(() => {
		const streamErrorListener = subLogStreamError.subscribe(setLogStreamError);
		const logSearchListener = subLogSearch.subscribe(setQuerySearch);
		const refreshIntervalListener = subRefreshInterval.subscribe(setRefreshInterval);

		const subLogQueryListener = subLogQuery.subscribe((state) => {
			setPageOffset(0);
			resetLogsData();
			resetStreamData();
			// resetColumns();

			if (state) {
				getQueryData({
					streamName: state.streamName,
					startTime: state.startTime,
					endTime: state.endTime,
					limit: loadLimit,
					pageOffset: 0,
				});
				getDataSchema();
			}
		});
		subLogStreamSchema.set(logsSchema);
		return () => {
			streamErrorListener();
			subLogQueryListener();
			refreshIntervalListener();
			logSearchListener();
		};
	}, [logsSchema]);

	useEffect(() => {
		const state = subLogQuery.get();
		getQueryData({
			streamName: state.streamName,
			startTime: state.startTime,
			endTime: state.endTime,
			limit: loadLimit,
			pageOffset: pageOffset,
		});
	}, [pageOffset]);

	useEffect(() => {
		if (subRefreshInterval.get()) {
			const interval = setInterval(() => {
				if (subLogSelectedTimeRange.get().state === 'fixed') {
					const now = dayjs().startOf('minute');
					const timeDiff = subLogQuery.get().endTime.getTime() - subLogQuery.get().startTime.getTime();
					subLogQuery.set((state) => {
						state.startTime = now.subtract(timeDiff).toDate();
						state.endTime = now.toDate();
					});
				}
			}, subRefreshInterval.get() as number);
			return () => clearInterval(interval);
		}
	}, [refreshInterval]);

	// const renderTh = useMemo(() => {
	// 	if (tableHeaders) {
	// 		return tableHeaders
	// 			.filter(
	// 				(tableHeader) =>
	// 					!disabledColumns.includes(tableHeader) && !pinnedColumns2.includes(tableHeader) && !skipFields.includes(tableHeader),
	// 			)
	// 			.map((tableHeader) => {
	// 				return (
	// 					<Column
	// 						key={tableHeader}
	// 						columnName={tableHeader}
	// 						appliedFilter={appliedFilter}
	// 						applyFilter={applyFilter}
	// 						getColumnFilters={getColumnFilters}
	// 						setSorting={sortingSetter(tableHeader)}
	// 						fieldSortOrder={sort.key === tableHeader ? sort.order : null}
	// 					/>
	// 				);
	// 			});
	// 	}

	// 	return null;
	// }, [tableHeaders, columnToggles, logs, sort, pinnedColumns, pinnedColumns2]);

	// const renderPinnedTh = useMemo(() => {
	// 	if (tableHeaders) {
	// 		return tableHeaders
	// 			.filter(
	// 				(tableHeader) =>
	// 				!disabledColumns.includes(tableHeader) && pinnedColumns2.includes(tableHeader) && !skipFields.includes(tableHeader),
	// 			)
	// 			.map((tableHeader) => {
	// 				return (
	// 					<Column
	// 						key={tableHeader}
	// 						columnName={tableHeader}
	// 						appliedFilter={appliedFilter}
	// 						applyFilter={applyFilter}
	// 						getColumnFilters={getColumnFilters}
	// 						setSorting={sortingSetter(tableHeader)}
	// 						fieldSortOrder={sort.key === tableHeader ? sort.order : null}
	// 					/>
	// 				);
	// 			});
	// 	}

	// 	return null;
	// }, [tableHeaders, columnToggles, logs, sort, pinnedColumns, pinnedColumns2]);

	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;

	const errorMessage = logStreamError || logStreamSchemaError || logsError
	const hasContentLoaded = !!tableHeaders.length && !!pageLogData?.data.length
	return (
		<TableContainer>
			<FilterPills />
			{!errorMessage ? (
				hasContentLoaded ? (
					<Box className={tableStyles.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={tableStyles.innerContainer}
							style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
							<PinnedColumns containerRefs={containerRefs} />
							<Columns
								reorderSchemaFields={reorderSchemaFields}
								// resetColumns={resetColumns}
								resetColumns={() => {}}
								containerRefs={containerRefs}
							/>
						</Box>
					</Box>
				) : pageLogData?.data.length === 0 ? (
					<EmptyBox message="No Data Available" />
				) : (
					<LoadingView />
				)
			) : (
				<ErrorView message={errorMessage} onRetry={onRetry} />
			)}
			<Footer />
		</TableContainer>
	);
};

type ThColumnMenuItemProps = {
	header: string;
	index: number;
	isColumnPinned: boolean;
	isColumnDisabled: boolean;
};

const ThColumnMenuItem: FC<ThColumnMenuItemProps> = (props) => {
	const { header, index, isColumnPinned, isColumnDisabled, toggleColumnPinned } = props;
	const classes = tableStyles;
	const [, setLogsStore] = useLogsStore(_store => null)
	
	const togglePinnedStatus = useCallback(() => {
		setLogsStore(store => togglePinnedColumns(store, header))
	}, [])
	
	const toggleDisabledStatus = useCallback(() => {
		setLogsStore(store => toggleDisabledColumns(store, header))
	}, [])

	if (skipFields.includes(header)) return null;
	return (
		<Draggable key={header} index={index} draggableId={header}>
			{(provided) => (
				<Menu.Item
					className={classes.thColumnMenuDraggable}
					style={{ cursor: 'default' }}
					ref={provided.innerRef}
					{...provided.draggableProps}>
					<Flex>
						<Box onClick={() => toggleColumnPinned(header)}>
							{isColumnPinned ? <IconPinFilled size="1.05rem" /> : <IconPin size="1.05rem" />}
						</Box>
						<Box className={classes.thColumnMenuDragHandle} {...provided.dragHandleProps}>
							<IconGripVertical size="1.05rem" stroke={1.5} />
						</Box>
						<Checkbox
							color="red"
							label={header}
							checked={!isColumnDisabled}
							onChange={toggleDisabledStatus}
						/>
					</Flex>
				</Menu.Item>
			)}
		</Draggable>
	);
};

type ThColumnMenuProps = {
	tableHeaders: Array<string>;
	toggleColumn: (columnName: string, value: boolean) => void;
	reorderColumn: (destination: number, source: number) => void;
	isColumnActive: (columnName: string) => boolean;
	isColumnPinned: (columnName: string) => boolean;
	toggleColumnPinned: (columnName: string) => void;
	resetColumns: () => void;
};

const ThColumnMenu: FC<ThColumnMenuProps> = (props) => {
	const { reorderColumn, resetColumns } = props;

	const classes = tableStyles;
	const { thColumnMenuBtn, thColumnMenuDropdown, thColumnMenuResetBtn } = classes;

	const [{ pinnedColumns, disabledColumns, headers }, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const isColumnPinned = useCallback(
		(column: string) => {
			return pinnedColumns.includes(column);
		},
		[pinnedColumns],
	);

	const isColumnDisabled = useCallback(
		(column: string) => {
			return disabledColumns.includes(column);
		},
		[disabledColumns],
	);

	return (
		<th>
			<Menu withArrow withinPortal shadow="md" position="left-start" zIndex={2} closeOnItemClick={false}>
				<Center>
					<Menu.Target>
						<ActionIcon className={thColumnMenuBtn}>
							<IconSettings size={px('1.4rem')} />
						</ActionIcon>
					</Menu.Target>
				</Center>
				<DragDropContext
					onDragEnd={({ destination, source }) => {
						const tableHeader = headers[source.index];
						const destIndex = destination?.index || 0;
						// Disallow dragging pinned to unpinned area and vice versa
						if (isColumnPinned(tableHeader) && destIndex >= pinnedColumns.length) return;
						if (!isColumnPinned(tableHeader) && destIndex < pinnedColumns.length) return;

						reorderColumn(destIndex, source.index);
					}}>
					<Menu.Dropdown className={thColumnMenuDropdown}>
						<Center>
							<Button className={thColumnMenuResetBtn} variant="default" onClick={resetColumns}>
								Reset Columns
							</Button>
						</Center>
						<Droppable droppableId="dnd-list" direction="vertical">
							{(provided) => (
								<div {...provided.droppableProps} ref={provided.innerRef}>
									{headers.map((tableHeader, index) => {
										return (
											<ThColumnMenuItem
												header={tableHeader}
												index={index}
												key={tableHeader}
												// toggleColumn={toggleColumn}
												// isColumnActive={isColumnActive}
												isColumnDisabled={isColumnDisabled(tableHeader)}
												toggleColumnPinned={(columnName) => {
													const isPinned = isColumnPinned(columnName);
													setLogsStore((store) => togglePinnedColumns(store, tableHeader));

													// Place the field in correct order
													if (isPinned) reorderColumn(pinnedColumns.length - 1, index);
													else reorderColumn(0, index);
												}}
												isColumnPinned={isColumnPinned(tableHeader)}
											/>
										);
									})}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</Menu.Dropdown>
				</DragDropContext>
			</Menu>
		</th>
	);
};

type LimitControlProps = {
	value: number;
	onChange: (limit: number) => void;
};

const LimitControl: FC<LimitControlProps> = (props) => {
	const [opened, setOpened] = useMountedState(false);
	const [perPage, setLogsStore] = useLogsStore(store => store.perPage)

	const toggle = () => {
		setOpened(!opened);
	};

	const onSelect = (limit: number) => {
		if (perPage !== limit) {
			setLogsStore(store => setPerPage(store, limit))
		}
	};

	const classes = tableStyles;
	const { limitContainer, limitBtn, limitBtnText, limitActive, limitOption } = classes;

	return (
		<Box className={limitContainer}>
			<Menu withArrow withinPortal shadow="md" opened={opened} onChange={setOpened}>
				<Center>
					<Menu.Target>
						<Box onClick={toggle} className={limitBtn}>
							<Text className={limitBtnText}>{perPage}</Text>
							<IconSelector size={px('1rem')} />
						</Box>
					</Menu.Target>
				</Center>
				<Menu.Dropdown>
					{LOG_TABLE_PER_PAGE.map((limit) => {
						return (
							<Menu.Item
								className={limit === perPage ? limitActive : limitOption}
								key={limit}
								onClick={() => onSelect(limit)}>
								<Center>
									<Text>{limit}</Text>
								</Center>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</Box>
	);
};

export default LogTable2;
