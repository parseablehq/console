import { MantineReactTable, MRT_ColumnDef } from 'mantine-react-table';
import { useCorrelationStore } from '../providers/CorrelationProvider';
import { useCallback, useEffect, useState } from 'react';
import tableStyles from '../styles/CorrelationLogs.module.css';
import { formatLogTs } from '@/pages/Stream/providers/LogsProvider';
import { CopyIcon } from '@/pages/Stream/Views/Explore/JSONView';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { LOGS_FOOTER_HEIGHT } from '@/constants/theme';
import { Log } from '@/@types/parseable/api/query';
import { FieldTypeMap } from '@/pages/Stream/providers/StreamProvider';
import _ from 'lodash';
import { Box } from '@mantine/core';
import EmptyBox from '@/components/Empty';
import { ErrorView, LoadingView } from '@/pages/Stream/Views/Explore/LoadingViews';

type CellType = string | number | boolean | null | undefined;

const getSanitizedValue = (value: CellType, isTimestamp: boolean) => {
	if (isTimestamp) {
		const timestamp = String(value).trim();
		const isValidTimestamp = !isNaN(Date.parse(timestamp));

		if (timestamp && isValidTimestamp) {
			return formatLogTs(timestamp);
		} else {
			return '';
		}
	}

	if (value === null || value === undefined) {
		return '';
	}

	if (typeof value === 'boolean') {
		return value.toString();
	}

	return String(value);
};

const makeColumnsFromSelectedFields = (pageData: Log[], isSecureHTTPContext: boolean, fieldTypeMap: FieldTypeMap) => {
	if (!pageData || pageData.length === 0 || !pageData[0]) {
		return [];
	}
	return Object.keys(pageData[0]).map((field: string) => ({
		id: field,
		header: field,
		accessorFn: (row: any) => {
			try {
				return _.get(row, field, '');
			} catch {
				return '';
			}
		},
		grow: true,
		Cell: ({ cell }: { cell: any }) => {
			const value = _.get(cell.row.original, field, '');
			const isTimestamp = _.get(fieldTypeMap, field, null) === 'timestamp';
			const sanitizedValue = getSanitizedValue(value, isTimestamp);

			return (
				<div className={tableStyles.customCellContainer} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
					{sanitizedValue}
					<div className={tableStyles.copyIconContainer}>
						{isSecureHTTPContext && sanitizedValue && <CopyIcon value={sanitizedValue} />}
					</div>
				</div>
			);
		},
	}));
};

const Table = (props: {
	primaryHeaderHeight: number;
	errorMessage: string | null;
	logsLoading: boolean;
	streamsLoading: boolean;
	hasNoData: boolean;
	showTable: boolean;
}) => {
	const { errorMessage, logsLoading, streamsLoading, primaryHeaderHeight, showTable, hasNoData } = props;
	const [{ pageData, wrapDisabledColumns }] = useCorrelationStore((store) => store.tableOpts);
	const [isSecureHTTPContext] = useAppStore((store) => store.isSecureHTTPContext);
	const [columns, setColumns] = useState<MRT_ColumnDef<Log, unknown>[]>([]);

	const showTableOrLoader = logsLoading || streamsLoading || showTable || !errorMessage || !hasNoData;

	useEffect(() => {
		const updatedColumns = makeColumnsFromSelectedFields(pageData, isSecureHTTPContext, {
			datetime: 'text',
			host: 'text',
			id: 'text',
			method: 'text',
			p_metadata: 'text',
			p_tags: 'text',
			p_timestamp: 'timestamp',
			referrer: 'text',
			status: 'number',
			'user-identifier': 'text',
		});
		setColumns(updatedColumns);
	}, [pageData]);

	const makeCellCustomStyles = useCallback(
		(columnName: string) => {
			return {
				className: tableStyles.customCell,
				style: {
					padding: '0.5rem 1rem',
					fontSize: '0.6rem',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					display: 'table-cell',
					...(!_.includes(wrapDisabledColumns, columnName) ? { whiteSpace: 'nowrap' as const } : {}),
				},
			};
		},
		[wrapDisabledColumns],
	);

	return (
		<Box className={tableStyles.container}>
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
								<MantineReactTable
									enableBottomToolbar={false}
									enableTopToolbar={false}
									enableColumnResizing={true}
									mantineTableBodyCellProps={({ column: { id } }) => makeCellCustomStyles(id)}
									mantineTableHeadRowProps={{ style: { border: 'none' } }}
									mantineTableHeadCellProps={{
										style: {
											fontWeight: 600,
											fontSize: '0.65rem',
											border: 'none',
											padding: '0.5rem 1rem',
										},
									}}
									mantineTableBodyRowProps={({ row }) => ({
										style: {
											border: 'none',
											background: row.index % 2 === 0 ? '#f8f9fa' : 'white',
										},
									})}
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
									initialState={{}}
									enableStickyHeader={true}
									defaultColumn={{ minSize: 100 }}
									layoutMode="grid"
									state={{}}
									mantineTableContainerProps={{
										style: {
											height: `calc(100vh - ${primaryHeaderHeight + LOGS_FOOTER_HEIGHT}px )`,
										},
									}}
								/>
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
		</Box>
	);
};

export default Table;
