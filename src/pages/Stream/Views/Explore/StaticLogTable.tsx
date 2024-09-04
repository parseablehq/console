import { Box } from '@mantine/core';
import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import EmptyBox from '@/components/Empty';
import FilterPills from '../../components/FilterPills';
import tableStyles from '../../styles/Logs.module.css';
import {
	LOGS_FOOTER_HEIGHT,
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import Footer from './Footer';
import { ErrorView, LoadingView } from './LoadingViews';
import { MantineReactTable } from 'mantine-react-table';
import Column from '../../components/Column';
import { Log } from '@/@types/parseable/api/query';
import { CopyIcon } from './JSONView';

const { setSelectedLog } = logsStoreReducers;

const TableContainer = (props: { children: ReactNode }) => {
	return <Box className={tableStyles.container}>{props.children}</Box>;
};

const makeHeaderOpts = (headers: string[]) => {
	return _.reduce(
		headers,
		(acc: { accessorKey: string; header: string; grow: boolean }[], header) => {
			return [
				...acc,
				{
					accessorKey: header,
					header,
					grow: true,
					Cell: ({ cell }: { cell: any }) => {
						const value = _.isFunction(cell.getValue) ? cell.getValue() : '';
						return (
							<div className={tableStyles.customCellContainer} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
								{value}
								<div className={tableStyles.copyIconContainer}>
									<CopyIcon value={value} />
								</div>
							</div>
						);
					},
				},
			];
		},
		[],
	);
};

const makeColumnVisiblityOpts = (columns: string[]) => {
	return _.reduce(columns, (acc, column) => ({ ...acc, [column]: false }), {});
};

const Table = (props: { primaryHeaderHeight: number }) => {
	const [{ orderedHeaders, disabledColumns, pinnedColumns, pageData, enableWordWrap }, setLogsStore] = useLogsStore(
		(store) => store.tableOpts,
	);
	const columns = useMemo(() => makeHeaderOpts(orderedHeaders), [orderedHeaders]);
	const columnVisibility = useMemo(() => makeColumnVisiblityOpts(disabledColumns), [disabledColumns, orderedHeaders]);
	const selectLog = useCallback((log: Log) => {
		setLogsStore((store) => setSelectedLog(store, log));
	}, []);
	return (
		<MantineReactTable
			enableBottomToolbar={false}
			enableTopToolbar={false}
			enableColumnResizing={true}
			mantineTableBodyCellProps={{
				className: tableStyles.customCell,
				style: {
					padding: '0.5rem 1rem',
					fontSize: '0.6rem',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					display: 'table-cell',
					...(enableWordWrap ? { whiteSpace: 'nowrap' } : {}),
				},
			}}
			mantineTableHeadRowProps={{ style: { border: 'none' } }}
			mantineTableHeadCellProps={{
				style: {
					fontWeight: 600,
					fontSize: '0.65rem',
					border: 'none',
					padding: '0.5rem 1rem',
				},
			}}
			mantineTableBodyRowProps={({ row }) => {
				return {
					onClick: () => {
						selectLog(row.original);
					},
					style: {
						border: 'none',
						background: row.index % 2 === 0 ? '#f8f9fa' : 'white',
					},
				};
			}}
			mantineTableHeadProps={{
				style: {
					border: 'none',
				},
			}}
			columns={columns}
			data={pageData}
			mantinePaperProps={{ style: { border: 'none' } }}
			enablePagination={false}
			enableColumnPinning={true}
			initialState={{
				columnPinning: {
					left: pinnedColumns,
				},
			}}
			enableStickyHeader={true}
			defaultColumn={{ minSize: 100 }}
			layoutMode="grid"
			state={{
				columnPinning: {
					left: pinnedColumns,
				},
				columnVisibility,
				columnOrder: orderedHeaders,
			}}
			mantineTableContainerProps={{
				style: {
					height: `calc(100vh - ${props.primaryHeaderHeight + LOGS_FOOTER_HEIGHT}px )`,
				},
			}}
			renderColumnActionsMenuItems={({ column }) => {
				return <Column columnName={column.id} />;
			}}
		/>
	);
};

const LogTable = (props: {
	errorMessage: string | null;
	hasNoData: boolean;
	showTable: boolean;
	isFetchingCount: boolean;
	logsLoading: boolean;
}) => {
	const { errorMessage, hasNoData, showTable, isFetchingCount, logsLoading } = props;
	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;

	const showTableOrLoader = logsLoading || showTable || !errorMessage || !hasNoData;

	return (
		<TableContainer>
			<FilterPills />
			{!errorMessage ? (
				showTableOrLoader ? (
					<Box className={tableStyles.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={tableStyles.innerContainer}
							style={{
								maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
								height: `calc(100vh - ${primaryHeaderHeight}px )`,
								position: 'relative',
							}}>
							<Box
								style={{
									position: 'absolute',
									...(logsLoading ? {} : { display: 'none' }),
									height: '100%',
									width: '100%',
									background: 'white',
									zIndex: 9,
								}}>
								{logsLoading && <LoadingView />}
							</Box>
							{hasNoData ? (
								<EmptyBox message="No Matching Rows" />
							) : (
								<Table primaryHeaderHeight={primaryHeaderHeight} />
							)}
						</Box>
					</Box>
				) : hasNoData ? (
					<></>
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
