import { Box, Menu } from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useLogsStore, logsStoreReducers, formatLogTs } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import Footer from './Footer';
import { ErrorView, LoadingView } from './LoadingViews';
import { MantineReactTable } from 'mantine-react-table';
import Column from '../../components/Column';
import { Log } from '@/@types/parseable/api/query';
import { CopyIcon } from './JSONView';
import { FieldTypeMap, useStreamStore } from '../../providers/StreamProvider';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { IconDotsVertical } from '@tabler/icons-react';
import { copyTextToClipboard } from '@/utils';
import { notifySuccess } from '@/utils/notification';

const { setSelectedLog, setRowNumber } = logsStoreReducers;
const TableContainer = (props: { children: ReactNode }) => {
	return <Box className={tableStyles.container}>{props.children}</Box>;
};

const localTz = timeRangeUtils.getLocalTimezone();

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

const makeHeaderOpts = (
	headers: string[],
	isSecureHTTPContext: boolean,
	fieldTypeMap: FieldTypeMap,
	rowNumber: string,
	setContextMenu: any,
) => {
	return _.reduce(
		headers,
		(acc: { accessorKey: string; header: string; grow: boolean }[], header, index) => {
			const isTimestamp = _.get(fieldTypeMap, header, null) === 'timestamp';

			return [
				...acc,
				{
					accessorKey: header,
					header: isTimestamp ? `${header} (${localTz})` : header,
					grow: true,
					Cell: ({ cell }: { cell: any }) => {
						const value = _.get(cell.row.original, header, '');
						const isTimestamp = _.chain(cell)
							.get('column.id', null)
							.thru((val) => {
								const datatype = _.get(fieldTypeMap, val, null);
								return datatype === 'timestamp';
							})
							.value();
						const sanitizedValue = getSanitizedValue(value, isTimestamp);
						let isFirstSelectedRow = false;
						if (rowNumber) {
							const [start] = rowNumber.split(':').map(Number);
							isFirstSelectedRow = cell.row.index === start;
						}
						const isFirstColumn = index === 0;
						return (
							<div
								className={tableStyles.customCellContainer}
								style={{
									marginLeft: isFirstSelectedRow && isFirstColumn ? '4px' : '',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}>
								<div
									className={tableStyles.actionIconContainer}
									onClick={(event) => {
										event.stopPropagation();
										setContextMenu({
											visible: true,
											x: event.pageX,
											y: event.pageY,
											row: cell.row.original,
										});
									}}
									style={{
										display: isFirstSelectedRow && isFirstColumn ? 'flex' : '',
									}}>
									{isSecureHTTPContext
										? sanitizedValue && <IconDotsVertical stroke={1.2} size={'0.8rem'} color="#545beb" />
										: null}
								</div>
								{sanitizedValue}
								<div className={tableStyles.copyIconContainer}>
									{isSecureHTTPContext ? sanitizedValue && <CopyIcon value={sanitizedValue} /> : null}
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
	const [contextMenu, setContextMenu] = useState<{
		visible: boolean;
		x: number;
		y: number;
		row: any | null;
	}>({
		visible: false,
		x: 0,
		y: 0,
		row: null,
	});

	const contextMenuRef = useRef<HTMLDivElement>(null);
	const [{ orderedHeaders, disabledColumns, pageData, wrapDisabledColumns, rowNumber }, setLogsStore] = useLogsStore(
		(store) => store.tableOpts,
	);
	const [isSecureHTTPContext] = useAppStore((store) => store.isSecureHTTPContext);
	const [fieldTypeMap] = useStreamStore((store) => store.fieldTypeMap);
	const columns = useMemo(
		() => makeHeaderOpts(orderedHeaders, isSecureHTTPContext, fieldTypeMap, rowNumber, setContextMenu),
		[orderedHeaders, rowNumber],
	);
	const columnVisibility = useMemo(() => makeColumnVisiblityOpts(disabledColumns), [disabledColumns, orderedHeaders]);
	const selectLog = useCallback((log: Log) => {
		const selectedText = window.getSelection()?.toString();
		if (selectedText !== undefined && selectedText?.length > 0) return;

		setLogsStore((store) => setSelectedLog(store, log));
	}, []);

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
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
				closeContextMenu();
			}
		};

		if (contextMenu.visible) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [contextMenu.visible]);

	const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, row: null });

	const copyUrl = useCallback(() => {
		copyTextToClipboard(window.location.href);
		notifySuccess({ message: 'Link Copied!' });
	}, [window.location.href]);

	const copyJSON = useCallback(() => {
		const [start, end] = rowNumber.split(':').map(Number);

		const rowsToCopy = pageData.slice(start, end + 1);

		copyTextToClipboard(rowsToCopy);
		notifySuccess({ message: 'JSON Copied!' });
	}, [rowNumber]);

	const handleRowClick = (index: number, event: React.MouseEvent) => {
		let newRange = `${index}:${index}`;

		if ((event.ctrlKey || event.metaKey) && rowNumber) {
			const [start, end] = rowNumber.split(':').map(Number);
			const lastIndex = Math.max(start, end);

			const startIndex = Math.min(lastIndex, index);
			const endIndex = Math.max(lastIndex, index);
			newRange = `${startIndex}:${endIndex}`;
			setLogsStore((store) => setRowNumber(store, newRange));
		} else {
			if (rowNumber) {
				const [start, end] = rowNumber.split(':').map(Number);
				if (index >= start && index <= end) {
					setLogsStore((store) => setRowNumber(store, ''));
					return;
				}
			}

			setLogsStore((store) => setRowNumber(store, newRange));
		}
	};

	return (
		<>
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
				mantineTableBodyRowProps={({ row }) => {
					return {
						onClick: (event) => {
							event.preventDefault();
							handleRowClick(row.index, event);
						},
						style: {
							border: 'none',
							background: row.index % 2 === 0 ? '#f8f9fa' : 'white',
							backgroundColor:
								rowNumber &&
								(() => {
									const [start, end] = rowNumber.split(':').map(Number);
									return row.index >= start && row.index <= end;
								})()
									? '#E8EDFE'
									: '',
						},
					};
				}}
				mantineTableProps={{ highlightOnHover: false }}
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
						left: ['rowNumber'],
					},
				}}
				enableStickyHeader={true}
				defaultColumn={{ minSize: 100 }}
				layoutMode="grid"
				state={{
					columnPinning: {
						left: ['rowNumber'],
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
			{contextMenu.visible && (
				<div
					ref={contextMenuRef}
					style={{
						top: contextMenu.y,
						left: contextMenu.x,
					}}
					className={tableStyles.contextMenuContainer}
					onClick={closeContextMenu}>
					<Menu opened={contextMenu.visible} onClose={closeContextMenu}>
						{(() => {
							const [start, end] = rowNumber.split(':').map(Number);
							const rowCount = end - start + 1;

							if (rowCount === 1) {
								return (
									<Menu.Item
										onClick={() => {
											selectLog(contextMenu.row);
											closeContextMenu();
										}}>
										View JSON
									</Menu.Item>
								);
							}

							return null;
						})()}
						<Menu.Item
							onClick={() => {
								copyJSON();
								closeContextMenu();
							}}>
							Copy JSON
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								copyUrl();
								closeContextMenu();
							}}>
							Copy permalink
						</Menu.Item>
					</Menu>
				</div>
			)}
		</>
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
