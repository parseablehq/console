import Loading from '@/components/Loading';
import { Tbody, Thead } from '@/components/Table';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import {
	Box,
	Center,
	Checkbox,
	Menu,
	Pagination,
	ScrollArea,
	Table,
	px,
	ActionIcon,
	Text,
	Flex,
	Button,
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';
import { LOG_QUERY_LIMITS, useLogsPageContext } from './Context';
import LogRow from './LogRow';
import { useLogTableStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';
import ErrorText from '@/components/Text/ErrorText';
import { IconDotsVertical, IconSelector, IconGripVertical, IconPin, IconPinFilled } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Field } from '@/@types/parseable/dataType';
import EmptyBox from '@/components/Empty';
import { RetryBtn } from '@/components/Button/Retry';
import Column from './Column';
import FilterPills from './FilterPills';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import dayjs from 'dayjs';
import { SortOrder } from '@/@types/parseable/api/query';

const skipFields = ['p_metadata', 'p_tags'];

const LogTable: FC = () => {
	const {
		state: { subLogStreamError },
	} = useLogsPageContext();
	const {
		state: { subLogSearch, subLogQuery, subRefreshInterval, subLogSelectedTimeRange },
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

	const appliedFilter = (key: string) => {
		return subLogSearch.get().filters[key] ?? [];
	};

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

	/**
	 * Function to get a setter to set sort order on a given field
	 */
	const sortingSetter = (columName: string) => {
		return (order: SortOrder | null) => {
			setQuerySearch((prev) => {
				const sort = {
					field: 'p_timestamp',
					order: SortOrder.DESCENDING,
				};
				if (order !== null) {
					sort.field = columName;
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

		if (logsSchema) {
			resetStreamData();
			resetLogsData();
		}

		getDataSchema(query.streamName);
		getQueryData(query);
		setColumnToggles(new Map());
	};

	useEffect(() => {
		const streamErrorListener = subLogStreamError.subscribe(setLogStreamError);
		const logSearchListener = subLogSearch.subscribe(setQuerySearch);
		const refreshIntervalListener = subRefreshInterval.subscribe(setRefreshInterval);
		const logQueryListener = subLogQuery.subscribe((query) => {
			if (query.streamName) {
				if (logsSchema) {
					resetStreamData();
					resetLogsData();
				}

				getDataSchema(query.streamName);
				getQueryData(query);
				setColumnToggles(new Map());
				setPinnedColumns(new Set());
			}
		});

		return () => {
			streamErrorListener();
			refreshIntervalListener();
			logQueryListener();
			logSearchListener();
		};
	}, [logsSchema]);

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

	useEffect(() => {
		const query = subLogQuery.get();

		if (query.streamName) {
			if (logsSchema) {
				resetStreamData();
				resetLogsData;
			}
			getDataSchema(query.streamName);
			getQueryData(query);
			setColumnToggles(new Map());
		}
	}, [subLogQuery]);
	const renderTh = useMemo(() => {
		if (logsSchema) {
			return logsSchema.fields
				.filter(
					(field) =>
						isColumnActive(field.name) && !isColumnPinned(field.name) && !skipFields.includes(field.name),
				)
				.map((field) => {
					return (
						<Column
							key={field.name}
							columnName={field.name}
							appliedFilter={appliedFilter}
							applyFilter={applyFilter}
							getColumnFilters={getColumnFilters}
							setSorting={sortingSetter(field.name)}
							fieldSortOrder={sort.field === field.name ? sort.order : null}
						/>
					);
				});
		}

		return null;
	}, [logsSchema, columnToggles, logs, sort, pinnedColumns]);

	const renderPinnedTh = useMemo(() => {
		if (logsSchema) {
			return logsSchema.fields
				.filter(
					(field) =>
						isColumnActive(field.name) && isColumnPinned(field.name) && !skipFields.includes(field.name),
				)
				.map((field) => {
					return (
						<Column
							key={field.name}
							columnName={field.name}
							appliedFilter={appliedFilter}
							applyFilter={applyFilter}
							getColumnFilters={getColumnFilters}
							setSorting={sortingSetter(field.name)}
							fieldSortOrder={sort.field === field.name ? sort.order : null}
						/>
					);
				});
		}

		return null;
	}, [logsSchema, columnToggles, logs, sort, pinnedColumns]);

	const { classes } = useLogTableStyles();

	const {
		container,
		innerContainer,
		tableContainer,
		pinnedTableContainer,
		tableStyle,
		theadStyle,
		errorContainer,
		footerContainer,
		paginationRow,
		theadStylePinned,
		pinnedScrollView,
	} = classes;

	const active = useRef<'left' | 'right'>('left');
	const leftRef = useRef<HTMLDivElement>(null);
	const rightRef = useRef<HTMLDivElement>(null);
	return (
		<Box className={container}>
			<FilterPills />
			{!(logStreamError || logStreamSchemaError || logsError) ? (
				!loading && !logsLoading && Boolean(logsSchema) && Boolean(pageLogData) ? (
					Boolean(logsSchema?.fields.length) && Boolean(pageLogData?.data.length) ? (
						<Box className={innerContainer}>
							<Box className={innerContainer} style={{ display: 'flex', flexDirection: 'row' }}>
								<ScrollArea
									maw={'50%'}
									miw={pinnedColumns.size ? '30%' : 0}
									className={pinnedScrollView}
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
									<Box className={pinnedTableContainer}>
										<Table className={tableStyle}>
											<Thead className={theadStylePinned}>{renderPinnedTh}</Thead>
											<Tbody>
												<LogRow
													logData={pageLogData?.data || []}
													logsSchema={
														logsSchema?.fields.filter((field) =>
															isColumnPinned(field.name),
														) || []
													}
													isColumnActive={isColumnActive}
												/>
											</Tbody>
										</Table>
									</Box>
								</ScrollArea>
								<Box style={{ height: '100%', border: '5px solid #ccc' }} />
								<ScrollArea
									onMouseEnter={() => {
										active.current = 'right';
									}}
									viewportRef={rightRef}
									onScrollPositionChange={({ y }) => {
										if (active.current === 'left') return;
										leftRef.current!.scrollTop = y;
									}}>
									<Box className={tableContainer}>
										<Table className={tableStyle}>
											<Thead className={theadStyle}>
												{renderTh}
												<ThColumnMenu
													logSchemaFields={logsSchema?.fields || []}
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
													logsSchema={
														logsSchema?.fields.filter(
															(field) => !isColumnPinned(field.name),
														) || []
													}
													isColumnActive={isColumnActive}
													rowArrows={true}
												/>
											</Tbody>
										</Table>
									</Box>
								</ScrollArea>
							</Box>
							<Box className={footerContainer}>
								<LimitControl value={pageLogData?.limit || 0} onChange={setPageLimit} />
								{(pageLogData?.totalPages || 0) > 1 && (
									<Pagination
										withEdges
										total={pageLogData?.totalPages || 0}
										value={pageLogData?.page || 0}
										onChange={(page) => {
											goToPage(page, pageLogData?.limit || 0);
										}}
										className={paginationRow}
									/>
								)}
							</Box>
						</Box>
					) : (
						<EmptyBox message="No Data Available" />
					)
				) : (
					<Loading visible variant="oval" position="absolute" zIndex={0} />
				)
			) : (
				<Center className={errorContainer}>
					<ErrorText>{logStreamError || logStreamSchemaError || logsError}</ErrorText>
					{(logsError || logStreamSchemaError) && <RetryBtn onClick={onRetry} mt="md" />}
				</Center>
			)}
		</Box>
	);
};

type ThColumnMenuItemProps = {
	field: Field;
	index: number;
	toggleColumn: (columnName: string, value: boolean) => void;
	isColumnActive: (columnName: string) => boolean;
	isColumnPinned: boolean;
	toggleColumnPinned: (columnName: string) => void;
};

const ThColumnMenuItem: FC<ThColumnMenuItemProps> = (props) => {
	const { field, index, toggleColumn, isColumnActive, toggleColumnPinned, isColumnPinned } = props;
	const { classes } = useLogTableStyles();
	if (skipFields.includes(field.name)) return null;

	return (
		<Draggable key={field.name} index={index} draggableId={field.name}>
			{(provided) => (
				<Menu.Item
					className={classes.thColumnMenuDraggable}
					style={{ cursor: 'default' }}
					ref={provided.innerRef}
					{...provided.draggableProps}>
					<Flex>
						<Box onClick={() => toggleColumnPinned(field.name)}>
							{isColumnPinned ? <IconPinFilled size="1.05rem" /> : <IconPin size="1.05rem" />}
						</Box>
						<Box className={classes.thColumnMenuDragHandle} {...provided.dragHandleProps}>
							<IconGripVertical size="1.05rem" stroke={1.5} />
						</Box>
						<Checkbox
							color="red"
							label={field.name}
							checked={isColumnActive(field.name)}
							onChange={(event) => toggleColumn(field.name, event.currentTarget.checked)}
						/>
					</Flex>
				</Menu.Item>
			)}
		</Draggable>
	);
};

type ThColumnMenuProps = {
	logSchemaFields: Array<Field>;
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
		logSchemaFields,
		isColumnActive,
		toggleColumn,
		reorderColumn,
		toggleColumnPinned,
		isColumnPinned,
		resetColumns,
	} = props;

	const { classes } = useLogTableStyles();
	const { thColumnMenuBtn, thColumnMenuDropdown, thColumnMenuResetBtn } = classes;

	const pinnedFields = logSchemaFields.filter((field) => isColumnPinned(field.name));

	return (
		<th>
			<Menu withArrow withinPortal shadow="md" position="left-start" zIndex={2} closeOnItemClick={false}>
				<Center>
					<Menu.Target>
						<ActionIcon className={thColumnMenuBtn}>
							<IconDotsVertical size={px('1.2rem')} />
						</ActionIcon>
					</Menu.Target>
				</Center>
				<DragDropContext
					onDragEnd={({ destination, source }) => {
						const field = logSchemaFields[source.index];
						const destIndex = destination?.index || 0;

						// Disallow dragging pinned to unpinned area and vice versa
						if (isColumnPinned(field.name) && destIndex >= pinnedFields.length) return;
						if (!isColumnPinned(field.name) && destIndex < pinnedFields.length) return;
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
									{logSchemaFields.map((field, index) => {
										return (
											<ThColumnMenuItem
												field={field}
												index={index}
												toggleColumn={toggleColumn}
												isColumnActive={isColumnActive}
												toggleColumnPinned={(columnName) => {
													const isPinned = isColumnPinned(columnName);
													toggleColumnPinned(columnName);

													// Place the field in correct order
													if (isPinned) reorderColumn(pinnedFields.length - 1, index);
													else reorderColumn(0, index);
												}}
												isColumnPinned={isColumnPinned(field.name)}
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

	const { classes } = useLogTableStyles();
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
