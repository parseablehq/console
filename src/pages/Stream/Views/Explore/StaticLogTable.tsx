import { Tbody, Thead } from '@/components/Table';
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
	Group,
	Stack,
	Tooltip,
	Loader,
} from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC, MutableRefObject, ReactNode, RefObject } from 'react';
import LogRow from './StaticLogRow';
import useMountedState from '@/hooks/useMountedState';
import {
	IconSelector,
	IconGripVertical,
	IconPin,
	IconPinFilled,
	IconSettings,
	IconDownload,
} from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EmptyBox from '@/components/Empty';
import { RetryBtn } from '@/components/Button/Retry';
import Column from '../../components/Column';
import FilterPills from '../../components/FilterPills';
import { usePagination } from '@mantine/hooks';
import tableStyles from '../../styles/Logs.module.css';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT, LOGS_SECONDARY_TOOLBAR_HEIGHT, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { HumanizeNumber } from '@/utils/formatBytes';
import { useLogsStore, logsStoreReducers, LOG_QUERY_LIMITS, LOAD_LIMIT } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import IconButton from '@/components/Button/IconButton';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';

const skipFields = ['p_metadata', 'p_tags'];

const {
	togglePinnedColumns,
	toggleDisabledColumns,
	setCurrentPage,
	setCurrentOffset,
	setPageAndPageData,
	getCleanStoreForRefetch,
	setCleanStoreForStreamChange,
	makeExportData,
} = logsStoreReducers;

const TotalCount = (props: { totalCount: number }) => {
	return (
		<Tooltip label={props.totalCount}>
			<Text style={{ fontSize: '0.7rem' }}>{HumanizeNumber(props.totalCount)}</Text>
		</Tooltip>
	);
};

const renderExportIcon = () => <IconDownload size={px('0.8rem')} stroke={1.8} />;

const TotalLogsCount = (props: { hasTableLoaded: boolean; isFetchingCount: boolean; isTableEmpty: boolean }) => {
	const [{ totalCount, perPage, pageData }] = useLogsStore((store) => store.tableOpts);
	const displayedCount = _.size(pageData);
	const showingCount = displayedCount < perPage ? displayedCount : perPage;
	if (typeof totalCount !== 'number' || typeof displayedCount !== 'number') return <Stack />;
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }} gap={6}>
			{props.hasTableLoaded ? (
				props.isFetchingCount ? (
					<Loader type="dots" />
				) : (
					<>
						<Text style={{ fontSize: '0.7rem' }}>{`Showing ${showingCount} out of`}</Text>
						<TotalCount totalCount={totalCount} />
						<Text style={{ fontSize: '0.7rem' }}>records</Text>
					</>
				)
			) : props.isTableEmpty ? null : (
				<Loader type="dots" />
			)}
		</Stack>
	);
};

const TableContainer = (props: { children: ReactNode }) => {
	return <Box className={tableStyles.container}>{props.children}</Box>;
};

const PinnedColumns = (props: { containerRefs: SectionRefs }) => {
	const { containerRefs } = props;
	const { leftSectionRef, rightSectionRef, activeSectionRef, pinnedContainerRef } = containerRefs;

	const [{ pinnedColumns }] = useLogsStore((store) => store.tableOpts);
	const [pinnedColumnsWidth, setPinnedColumnsWidth] = useMountedState(0);

	useEffect(() => {
		if (
			pinnedContainerRef.current?.offsetWidth &&
			pinnedContainerRef.current?.clientWidth < 500 &&
			pinnedColumns.length > 0
		) {
			setPinnedColumnsWidth(pinnedContainerRef.current?.clientWidth);
		} else if (
			pinnedContainerRef.current?.offsetWidth &&
			pinnedContainerRef.current?.clientWidth > 500 &&
			pinnedColumns.length > 0
		) {
			setPinnedColumnsWidth(500);
		} else {
			setPinnedColumnsWidth(0);
		}
	}, [pinnedContainerRef, pinnedColumns]);

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
			<Box className={tableStyles.pinnedTableContainer} ref={pinnedContainerRef}>
				<Table className={tableStyles.tableStyle}>
					<Thead className={tableStyles.theadStylePinned}>
						<TableHeader isPinned />
					</Thead>
					<Tbody>
						<LogRow isPinned={true} />
					</Tbody>
				</Table>
			</Box>
		</ScrollArea>
	);
};

const Columns = (props: { containerRefs: SectionRefs }) => {
	const { containerRefs } = props;
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
						<ThColumnMenu />
					</Thead>
					<Tbody>
						<LogRow rowArrows />
					</Tbody>
				</Table>
			</Box>
		</ScrollArea>
	);
};

const ErrorView = (props: { message: string }) => {
	const [, setLogsStore] = useLogsStore((_store) => null);
	const { message } = props;
	const onRetry = useCallback(() => {
		setLogsStore((store) => getCleanStoreForRefetch(store));
	}, []);
	return (
		<Center className={tableStyles.errorContainer}>
			<Text c="red.8" style={{ fontWeight: 400 }}>
				{message || 'Error'}
			</Text>
			<RetryBtn onClick={onRetry} mt="md" />
		</Center>
	);
};

const LoadingView = () => {
	return (
		<Stack
			w="100%"
			align="center"
			h="100%"
			style={{
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Loader type="parseable" />
		</Stack>
	);
};

const Footer = (props: { loaded: boolean; isLoading: boolean; hasNoData: boolean }) => {
	const [tableOpts, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const [filteredData] = useLogsStore((store) => store.data.filteredData);
	const { totalPages, currentOffset, currentPage, perPage, headers, totalCount } = tableOpts;
	const onPageChange = useCallback((page: number) => {
		setLogsStore((store) => setPageAndPageData(store, page));
	}, []);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const pagination = usePagination({ total: totalPages ?? 1, initialPage: 1, onChange: onPageChange });
	const onChangeOffset = useCallback(
		(key: 'prev' | 'next') => {
			if (key === 'prev') {
				const targetOffset = currentOffset - LOAD_LIMIT;
				if (currentOffset < 0) return;

				if (targetOffset === 0 && currentOffset > 0) {
					// hack to initiate fetch
					setLogsStore((store) => setCurrentPage(store, 0));
				}
				setLogsStore((store) => setCurrentOffset(store, targetOffset));
			} else {
				const targetOffset = currentOffset + LOAD_LIMIT;
				setLogsStore((store) => setCurrentOffset(store, targetOffset));
			}
		},
		[currentOffset],
	);

	const exportHandler = useCallback(
		(fileType: string | null) => {
			const filename = `${currentStream}-logs`;
			if (fileType === 'CSV') {
				downloadDataAsCSV(makeExportData(filteredData, headers, 'CSV'), filename);
			} else if (fileType === 'JSON') {
				downloadDataAsJson(makeExportData(filteredData, headers, 'JSON'), filename);
			}
		},
		[currentStream, filteredData, headers],
	);

	return (
		<Stack className={tableStyles.footerContainer} gap={0}>
			<Stack w="100%" justify="center" align="flex-start">
				<TotalLogsCount
					hasTableLoaded={props.loaded}
					isFetchingCount={props.isLoading}
					isTableEmpty={props.hasNoData}
				/>
			</Stack>
			<Stack w="100%" justify="center">
				{props.loaded ? (
					<Pagination.Root
						total={totalPages}
						value={currentPage}
						onChange={(page) => {
							pagination.setPage(page);
						}}
						size="sm">
						<Group gap={5} justify="center">
							<Pagination.First
								onClick={() => {
									currentOffset !== 0 && onChangeOffset('prev');
								}}
								disabled={currentOffset === 0}
							/>
							<Pagination.Previous />
							{pagination.range.map((page, index) => {
								if (page === 'dots') {
									return <Pagination.Dots key={index} />;
								} else {
									return (
										<Pagination.Control
											value={page}
											key={index}
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
								disabled={!(currentOffset + LOAD_LIMIT < totalCount)}
							/>
						</Group>
					</Pagination.Root>
				) : null}
			</Stack>
			<Stack w="100%" align="flex-end" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
				{props.loaded && (
					<Menu position="top">
						<Menu.Target>
							<div>
								<IconButton renderIcon={renderExportIcon} />
							</div>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item onClick={() => exportHandler('CSV')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								CSV
							</Menu.Item>
							<Menu.Item onClick={() => exportHandler('JSON')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								JSON
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				)}
				<LimitControl />
			</Stack>
		</Stack>
	);
};

const TableHeader = (props: { isPinned?: boolean }) => {
	const [{ headers, disabledColumns, pinnedColumns }] = useLogsStore((store) => store.tableOpts);

	if (headers.length > 0) {
		return headers
			.filter((tableHeader) => !disabledColumns.includes(tableHeader) && !skipFields.includes(tableHeader))
			.filter((tableHeader) =>
				props.isPinned ? pinnedColumns.includes(tableHeader) : !pinnedColumns.includes(tableHeader),
			)
			.map((tableHeader) => {
				return <Column key={tableHeader} columnName={tableHeader} />;
			});
	}

	return null;
};

type HTMLDivRef = RefObject<HTMLDivElement>;

interface SectionRefs {
	activeSectionRef: MutableRefObject<string>;
	leftSectionRef: HTMLDivRef;
	rightSectionRef: HTMLDivRef;
	pinnedContainerRef: HTMLDivRef;
}

const LogTable = (props: { schemaLoading: boolean }) => {
	const [containerRefs, _setContainerRefs] = useState<SectionRefs>({
		activeSectionRef: useRef<'left' | 'right'>('left'),
		leftSectionRef: useRef<HTMLDivElement>(null),
		rightSectionRef: useRef<HTMLDivElement>(null),
		pinnedContainerRef: useRef<HTMLDivElement>(null),
	});
	const [maximized] = useAppStore((store) => store.maximized);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;

	const { getQueryData, loading: logsLoading, error: logsError, fetchCount, isFetchingCount } = useQueryLogs();
	const [currentPage] = useLogsStore((store) => store.tableOpts.currentPage);
	const [currentOffset, setLogsStore] = useLogsStore((store) => store.tableOpts.currentOffset);

	useEffect(() => {
		setLogsStore(setCleanStoreForStreamChange);
	}, [currentStream]);

	useEffect(() => {
		if (currentPage === 0 && currentOffset === 0) {
			getQueryData();
			fetchCount();
		}
	}, [currentPage]);

	useEffect(() => {
		if (currentOffset !== 0 && currentPage !== 0) {
			getQueryData();
		}
	}, [currentOffset]);

	const [pageData] = useLogsStore((store) => store.tableOpts.pageData);
	const hasContentLoaded = props.schemaLoading === false && logsLoading === false;
	const errorMessage = logsError;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	return (
		<TableContainer>
			<FilterPills />
			{!errorMessage ? (
				showTable ? (
					<Box className={tableStyles.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={tableStyles.innerContainer}
							style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
							<PinnedColumns containerRefs={containerRefs} />
							<Columns containerRefs={containerRefs} />
						</Box>
					</Box>
				) : hasNoData ? (
					<EmptyBox message="No Matching Rows" />
				) : (
					<LoadingView />
				)
			) : (
				<ErrorView message={errorMessage} />
			)}
			<Footer loaded={showTable} isLoading={isFetchingCount} hasNoData={hasNoData} />
		</TableContainer>
	);
};

type ThColumnMenuItemProps = {
	header: string;
	index: number;
	isColumnPinned: boolean;
	isColumnDisabled: boolean;
	toggleColumnPinned: (columnName: string) => void;
};

const ThColumnMenuItem: FC<ThColumnMenuItemProps> = (props) => {
	const { header, index, isColumnPinned, isColumnDisabled, toggleColumnPinned } = props;
	const classes = tableStyles;
	const [, setLogsStore] = useLogsStore((_store) => null);

	const toggleDisabledStatus = useCallback(() => {
		setLogsStore((store) => toggleDisabledColumns(store, header));
	}, []);

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
						<Checkbox color="red" label={header} checked={!isColumnDisabled} onChange={toggleDisabledStatus} />
					</Flex>
				</Menu.Item>
			)}
		</Draggable>
	);
};

const ThColumnMenu: FC = () => {
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

						// reorderColumn(destIndex, source.index);
					}}>
					<Menu.Dropdown className={thColumnMenuDropdown}>
						<Center>
							<Button className={thColumnMenuResetBtn} variant="default" onClick={() => {}}>
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
												isColumnDisabled={isColumnDisabled(tableHeader)}
												toggleColumnPinned={(_columnName: string) => {
													setLogsStore((store) => togglePinnedColumns(store, tableHeader));

													// Place the field in correct order
													// if (isPinned) reorderColumn(pinnedColumns.length - 1, index);
													// else reorderColumn(0, index);
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

const LimitControl: FC = () => {
	const [opened, setOpened] = useMountedState(false);
	const [perPage, setLogsStore] = useLogsStore((store) => store.tableOpts.perPage);

	const toggle = () => {
		setOpened(!opened);
	};

	const onSelect = (limit: number) => {
		if (perPage !== limit) {
			setLogsStore((store) => setPageAndPageData(store, 1, limit));
		}
	};

	const classes = tableStyles;
	const { limitBtn, limitBtnText, limitActive, limitOption } = classes;

	return (
		<Box>
			<Menu withArrow withinPortal shadow="md" opened={opened} onChange={setOpened}>
				<Center>
					<Menu.Target>
						<Box onClick={toggle} className={limitBtn}>
							<Text className={limitBtnText}>{perPage}</Text>
							<IconSelector size={'0.8rem'} />
						</Box>
					</Menu.Target>
				</Center>
				<Menu.Dropdown>
					{LOG_QUERY_LIMITS.map((limit) => {
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

export default LogTable;
