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
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';
import { LOG_QUERY_LIMITS, useLogsPageContext, LOAD_LIMIT as loadLimit, LOAD_LIMIT } from './context';
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

const skipFields = ['p_metadata', 'p_tags'];

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
	if (!selectClause) return allColumns;

	const commonColumns = allColumns.filter((column) => selectClause.includes(column));
	return commonColumns;
};

type TotalLogsCountProps = {
	totalCount: number | null;
	loadedCount: number | null;
};

const TotalLogsCount = (props: TotalLogsCountProps) => {
	const { totalCount, loadedCount } = props;
	if (typeof totalCount !== 'number' || typeof loadedCount !== 'number') return <Stack />;

	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center' }}>
			<Text>{`Showing ${loadedCount < LOAD_LIMIT ? loadedCount : LOAD_LIMIT} out of ${HumanizeNumber(
				totalCount,
			)} records`}</Text>
		</Stack>
	);
};

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
	const [pinnedColumns, setPinnedColumns] = useMountedState<Set<string>>(new Set());
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
				startTime: queryContext.startTime,
				endTime: queryContext.endTime,
				access: [],
			};
			fetchQueryMutation.mutate({
				logsQuery,
				query,
			});
		}
	}, [currentStreamName, isQuerySearchActive]);

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

	const isColumnPinned = useCallback((columnName: string) => pinnedColumns.has(columnName), [pinnedColumns]);

	const toggleColumnPinned = (columnName: string) => {
		setPinnedColumns((prev) => {
			if (prev.has(columnName)) {
				prev.delete(columnName);
			} else {
				prev.add(columnName);
			}

			return new Set(prev);
		});
	};

	const resetColumns = () => {
		setPinnedColumns(new Set());
		setColumnToggles(new Map());
	};
	const onRetry = () => {
		const query = subLogQuery.get();
		resetStreamData();
		resetLogsData();
		resetColumns();
		setPageOffset(0);

		if (query) {
			getQueryData({
				streamName: query.streamName,
				startTime: query.startTime,
				endTime: query.endTime,
				limit: loadLimit,
				pageOffset: 0,
			});
			getDataSchema(query.streamName);
		}
	};

	useEffect(() => {
		if (subLogQuery.get()) {
			const query = subLogQuery.get();
			resetColumns();
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
				getDataSchema(query.streamName);
			}
		}
	}, [custSearchQuery]);

	useEffect(() => {
		if (pageOffset === 0 && subLogQuery.get()) {
			fetchCount();
		}
	}, [currentStreamName, isQuerySearchActive]);

	useEffect(() => {
		const streamErrorListener = subLogStreamError.subscribe(setLogStreamError);
		const logSearchListener = subLogSearch.subscribe(setQuerySearch);
		const refreshIntervalListener = subRefreshInterval.subscribe(setRefreshInterval);

		const subLogQueryListener = subLogQuery.subscribe((state) => {
			setPageOffset(0);
			resetLogsData();
			resetStreamData();
			resetColumns();

			if (state) {
				getQueryData({
					streamName: state.streamName,
					startTime: state.startTime,
					endTime: state.endTime,
					limit: loadLimit,
					pageOffset: 0,
				});
				getDataSchema(state.streamName);
			}
		});
		subLogStreamSchema.set(logsSchema);
		return () => {
			streamErrorListener();
			subLogQueryListener();
			// subID();
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
					const now = dayjs();
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

	const renderTh = useMemo(() => {
		if (tableHeaders) {
			return tableHeaders
				.filter(
					(tableHeader) =>
						isColumnActive(tableHeader) && !isColumnPinned(tableHeader) && !skipFields.includes(tableHeader),
				)
				.map((tableHeader) => {
					return (
						<Column
							key={tableHeader}
							columnName={tableHeader}
							appliedFilter={appliedFilter}
							applyFilter={applyFilter}
							getColumnFilters={getColumnFilters}
							setSorting={sortingSetter(tableHeader)}
							fieldSortOrder={sort.key === tableHeader ? sort.order : null}
						/>
					);
				});
		}

		return null;
	}, [tableHeaders, columnToggles, logs, sort, pinnedColumns]);

	const renderPinnedTh = useMemo(() => {
		if (tableHeaders) {
			return tableHeaders
				.filter(
					(tableHeader) =>
						isColumnActive(tableHeader) && isColumnPinned(tableHeader) && !skipFields.includes(tableHeader),
				)
				.map((tableHeader) => {
					return (
						<Column
							key={tableHeader}
							columnName={tableHeader}
							appliedFilter={appliedFilter}
							applyFilter={applyFilter}
							getColumnFilters={getColumnFilters}
							setSorting={sortingSetter(tableHeader)}
							fieldSortOrder={sort.key === tableHeader ? sort.order : null}
						/>
					);
				});
		}

		return null;
	}, [tableHeaders, columnToggles, logs, sort, pinnedColumns]);

	const active = useRef<'left' | 'right'>('left');
	const leftRef = useRef<HTMLDivElement>(null);
	const rightRef = useRef<HTMLDivElement>(null);
	const pinnedContianerRef = useRef<HTMLDivElement>(null);
	const [pinnedColumnsWidth, setPinnedColumnsWidth] = useMountedState(0);
	const pagination = usePagination({ total: pageLogData?.totalPages ?? 1, initialPage: 1 });

	useEffect(() => {
		if (
			pinnedContianerRef.current?.offsetWidth &&
			pinnedContianerRef.current?.clientWidth < 500 &&
			pinnedColumns.size > 0
		) {
			setPinnedColumnsWidth(pinnedContianerRef.current?.clientWidth);
		} else if (
			pinnedContianerRef.current?.offsetWidth &&
			pinnedContianerRef.current?.clientWidth > 500 &&
			pinnedColumns.size > 0
		) {
			setPinnedColumnsWidth(500);
		} else {
			setPinnedColumnsWidth(0);
		}
	}, [pinnedContianerRef, pinnedColumns]);

	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;

	const totalCount = Array.isArray(fetchQueryMutation?.data) ? fetchQueryMutation.data[0]?.count : null;
	const loadedCount = pageLogData?.data.length || null
	return (
		<Box
			className={tableStyles.container}
			style={{
				maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
			}}>
			<FilterPills />
			{!(logStreamError || logStreamSchemaError || logsError) ? (
				Boolean(tableHeaders.length) && Boolean(pageLogData?.data.length) ? (
					<Box className={tableStyles.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={tableStyles.innerContainer}
							style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
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
									active.current = 'left';
								}}
								viewportRef={leftRef}
								onScrollPositionChange={({ y }) => {
									if (active.current === 'right') return;
									rightRef.current!.scrollTop = y;
								}}>
								<Box className={tableStyles.pinnedTableContainer} ref={pinnedContianerRef}>
									<Table className={tableStyles.tableStyle}>
										<Thead className={tableStyles.theadStylePinned}>{renderPinnedTh}</Thead>
										<Tbody>
											<LogRow
												logData={pageLogData?.data || []}
												headers={tableHeaders.filter((tableHeader) => isColumnPinned(tableHeader)) || []}
												isColumnActive={isColumnActive}
											/>
										</Tbody>
									</Table>
								</Box>
							</ScrollArea>
							{pinnedColumnsWidth > 0 && <Box style={{ height: '100%', borderLeft: '1px solid #ccc' }} />}
							<ScrollArea
								onMouseEnter={() => {
									active.current = 'right';
								}}
								viewportRef={rightRef}
								onScrollPositionChange={({ y }) => {
									if (active.current === 'left') return;
									leftRef.current!.scrollTop = y;
								}}>
								<Box className={tableStyles.tableContainer}>
									<Table className={tableStyles.tableStyle}>
										<Thead className={tableStyles.theadStyle}>
											{renderTh}
											<ThColumnMenu
												tableHeaders={tableHeaders || []}
												columnToggles={columnToggles}
												toggleColumn={toggleColumn}
												isColumnActive={isColumnActive}
												reorderColumn={reorderSchemaFields}
												isColumnPinned={isColumnPinned}
												toggleColumnPinned={toggleColumnPinned}
												resetColumns={resetColumns}
											/>
										</Thead>
										<Tbody>
											<LogRow
												logData={pageLogData?.data || []}
												headers={tableHeaders.filter((tableHeader) => !isColumnPinned(tableHeader)) || []}
												isColumnActive={isColumnActive}
												rowArrows={true}
											/>
										</Tbody>
									</Table>
								</Box>
							</ScrollArea>
						</Box>
					</Box>
				) : pageLogData?.data.length === 0 ? (
					<EmptyBox message="No Data Available" />
				) : (
					<EmptyBox message="Select a time Slot " />
				)
			) : (
				<Center className={tableStyles.errorContainer}>
					<Text c="red.8" style={{ fontWeight: 400 }}>
						{logStreamError || logStreamSchemaError || logsError || 'Error'}
					</Text>
					{(logsError || logStreamSchemaError) && <RetryBtn onClick={onRetry} mt="md" />}
				</Center>
			)}
			<Box className={tableStyles.footerContainer}>
				<TotalLogsCount totalCount={totalCount} loadedCount={loadedCount} />
				{!loading && !logsLoading ? (
					<Pagination.Root
						total={pageLogData?.totalPages || 1}
						value={pageLogData?.page || 1}
						onChange={(page) => {
							goToPage(page, pageLogData?.limit || 1);
							pagination.setPage(page);
						}}>
						<Group gap={5} justify="center">
							<Pagination.First
								onClick={() => {
									if (pageOffset !== 0) setPageOffset((value) => value - loadLimit);
								}}
								disabled={pageOffset === 0}
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
											active={pageLogData?.page === page}
											onClick={() => {
												goToPage(page);
												pagination.setPage(page);
											}}>
											{pageLogData?.limit ? page + pageOffset / pageLogData?.limit ?? 1 : page}
										</Pagination.Control>
									);
								}
							})}

							<Pagination.Next />
							<Pagination.Last
								onClick={() => {
									setPageOffset((value) => {
										return value + loadLimit;
									});
								}}
								disabled={false}
							/>
						</Group>
					</Pagination.Root>
				) : (
					<Loader variant="dots" />
				)}
				<LimitControl value={pageLogData?.limit || 0} onChange={setPageLimit} />
			</Box>
		</Box>
	);
};

type ThColumnMenuItemProps = {
	header: string;
	index: number;
	toggleColumn: (columnName: string, value: boolean) => void;
	isColumnActive: (columnName: string) => boolean;
	isColumnPinned: boolean;
	toggleColumnPinned: (columnName: string) => void;
};

const ThColumnMenuItem: FC<ThColumnMenuItemProps> = (props) => {
	const { header, index, toggleColumn, isColumnActive, toggleColumnPinned, isColumnPinned } = props;
	const classes = tableStyles;
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
							checked={isColumnActive(header)}
							onChange={(event) => toggleColumn(header, event.currentTarget.checked)}
						/>
					</Flex>
				</Menu.Item>
			)}
		</Draggable>
	);
};

type ThColumnMenuProps = {
	tableHeaders: Array<string>;
	columnToggles: Map<string, boolean>;
	toggleColumn: (columnName: string, value: boolean) => void;
	reorderColumn: (destination: number, source: number) => void;
	isColumnActive: (columnName: string) => boolean;
	isColumnPinned: (columnName: string) => boolean;
	toggleColumnPinned: (columnName: string) => void;
	resetColumns: () => void;
};

const ThColumnMenu: FC<ThColumnMenuProps> = (props) => {
	const {
		tableHeaders,
		isColumnActive,
		toggleColumn,
		reorderColumn,
		toggleColumnPinned,
		isColumnPinned,
		resetColumns,
	} = props;

	const classes = tableStyles;
	const { thColumnMenuBtn, thColumnMenuDropdown, thColumnMenuResetBtn } = classes;

	const pinnedFields = tableHeaders.filter((tableHeader) => isColumnPinned(tableHeader));

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
						const tableHeader = tableHeaders[source.index];
						const destIndex = destination?.index || 0;

						// Disallow dragging pinned to unpinned area and vice versa
						if (isColumnPinned(tableHeader) && destIndex >= pinnedFields.length) return;
						if (!isColumnPinned(tableHeader) && destIndex < pinnedFields.length) return;
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
									{tableHeaders.map((tableHeader, index) => {
										return (
											<ThColumnMenuItem
												header={tableHeader}
												index={index}
												key={tableHeader}
												toggleColumn={toggleColumn}
												isColumnActive={isColumnActive}
												toggleColumnPinned={(columnName) => {
													const isPinned = isColumnPinned(columnName);
													toggleColumnPinned(columnName);

													// Place the field in correct order
													if (isPinned) reorderColumn(pinnedFields.length - 1, index);
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
	const { value, onChange } = props;

	const [opened, setOpened] = useMountedState(false);

	const toggle = () => {
		setOpened(!opened);
	};

	const onSelect = (limit: number) => {
		if (value !== limit) {
			onChange(limit);
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
							<Text className={limitBtnText}>{value}</Text>
							<IconSelector size={px('1rem')} />
						</Box>
					</Menu.Target>
				</Center>
				<Menu.Dropdown>
					{LOG_QUERY_LIMITS.map((limit) => {
						return (
							<Menu.Item
								className={limit === value ? limitActive : limitOption}
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

export default LogTable;
