import { Tbody, Thead } from '@/components/Table';
import { Box, ScrollArea, Table } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject, ReactNode, RefObject } from 'react';
import LogRow from './StaticLogRow';
import useMountedState from '@/hooks/useMountedState';
import EmptyBox from '@/components/Empty';
import Column from '../../components/Column';
import FilterPills from '../../components/FilterPills';
import tableStyles from '../../styles/Logs.module.css';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { useLogsStore } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import Footer from './Footer';
import { ErrorView, LoadingView } from './LoadingViews';

const skipFields = ['p_metadata', 'p_tags'];

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
						<LogRow isPinned />
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
	const [{ orderedHeaders, disabledColumns, pinnedColumns }] = useLogsStore((store) => store.tableOpts);

	if (orderedHeaders.length > 0) {
		return orderedHeaders
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

export default LogTable;
