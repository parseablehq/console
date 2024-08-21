import { Tbody, Thead } from '@/components/Table';
import { Box, Center, Checkbox, Menu, ScrollArea, Table, px, ActionIcon, Flex, Button } from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC, MutableRefObject, ReactNode, RefObject } from 'react';
import LogRow from './StaticLogRow';
import useMountedState from '@/hooks/useMountedState';
import { IconGripVertical, IconPin, IconPinFilled, IconSettings } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EmptyBox from '@/components/Empty';
import Column from '../../components/Column';
import FilterPills from '../../components/FilterPills';
import tableStyles from '../../styles/Logs.module.css';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import Footer from './Footer';
import { ErrorView, LoadingView } from './LoadingViews';

const skipFields = ['p_metadata', 'p_tags'];

const { togglePinnedColumns, toggleDisabledColumns } = logsStoreReducers;

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

const LogTable = (props: {
	errorMessage: string | null;
	hasNoData: boolean;
	showTable: boolean;
	isFetchingCount: boolean;
}) => {
	const { errorMessage, hasNoData, showTable, isFetchingCount } = props;
	const [containerRefs, _setContainerRefs] = useState<SectionRefs>({
		activeSectionRef: useRef<'left' | 'right'>('left'),
		leftSectionRef: useRef<HTMLDivElement>(null),
		rightSectionRef: useRef<HTMLDivElement>(null),
		pinnedContainerRef: useRef<HTMLDivElement>(null),
	});
	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;

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
			<Footer loaded={showTable} hasNoData={hasNoData} isFetchingCount={isFetchingCount} />
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

export default LogTable;
