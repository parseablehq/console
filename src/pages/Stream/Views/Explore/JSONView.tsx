import { Box, Button, Loader, Menu, Stack, Text, TextInput } from '@mantine/core';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import classes from '../../styles/JSONView.module.css';
import EmptyBox from '@/components/Empty';
import { ErrorView, LoadingView } from './LoadingViews';
import Footer from './Footer';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { useLogsStore, logsStoreReducers, isJqSearch, formatLogTs } from '../../providers/LogsProvider';
import { Log } from '@/@types/parseable/api/query';
import _ from 'lodash';
import jqSearch from '@/utils/jqSearch';
import { IconCheck, IconCopy, IconDotsVertical, IconSearch } from '@tabler/icons-react';
import { copyTextToClipboard } from '@/utils';
import { useStreamStore } from '../../providers/StreamProvider';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { AxiosError } from 'axios';
import { useHotkeys } from '@mantine/hooks';
import { notifySuccess } from '@/utils/notification';
import { isFirstRowInRange, isRowHighlighted } from '../../utils';

type ContextMenuState = {
	visible: boolean;
	x: number;
	y: number;
	row: Log | null;
};

const { setInstantSearchValue, applyInstantSearch, applyJqSearch, setRowNumber, setSelectedLog } = logsStoreReducers;

const Item = (props: { header: string | null; value: string; highlight: boolean }) => {
	return (
		<span className={classes.itemContainer}>
			<span style={{ background: props.highlight ? 'yellow' : 'transparent' }} className={classes.itemHeader}>
				{props.header}: {props.value}
			</span>
		</span>
	);
};

export const CopyIcon = (props: { value: Log | string }) => {
	const copyIconRef = useRef<HTMLDivElement>(null);
	const copiedIconRef = useRef<HTMLDivElement>(null);

	const onCopy = async (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		if (copyIconRef.current && copiedIconRef.current) {
			copyIconRef.current.style.display = 'none';
			copiedIconRef.current.style.display = 'flex';
		}
		await copyTextToClipboard(props.value);
		setTimeout(() => {
			if (copyIconRef.current && copiedIconRef.current) {
				copiedIconRef.current.style.display = 'none';
				copyIconRef.current.style.display = 'flex';
			}
		}, 1500);
	};

	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 2 }} className={classes.toggleIcon}>
			<Box ref={copyIconRef} style={{ display: 'flex', height: 'auto' }} onClick={onCopy} className={classes.copyIcon}>
				<IconCopy stroke={1.2} size={'0.8rem'} />
			</Box>
			<Box ref={copiedIconRef} style={{ display: 'none', color: 'green' }}>
				<IconCheck stroke={1.2} size={'0.8rem'} />
			</Box>
		</Stack>
	);
};

const localTz = timeRangeUtils.getLocalTimezone();

const Row = (props: {
	log: Log;
	searchValue: string;
	disableHighlight: boolean;
	isRowHighlighted: boolean;
	showEllipses: boolean;
	setContextMenu: any;
	shouldHighlight: (header: string | null, val: number | string | Date | null) => boolean;
}) => {
	const [isSecureHTTPContext] = useAppStore((store) => store.isSecureHTTPContext);
	const [fieldTypeMap] = useStreamStore((store) => store.fieldTypeMap);
	const { log, disableHighlight, shouldHighlight, isRowHighlighted, showEllipses, setContextMenu } = props;

	return (
		<Stack
			style={{ flexDirection: 'row', background: isRowHighlighted ? '#E8EDFE' : 'white' }}
			className={classes.rowContainer}
			gap={0}>
			{showEllipses && (
				<div
					className={classes.actionIconContainer}
					onClick={(event) => {
						event.stopPropagation();
						setContextMenu({
							visible: true,
							x: event.pageX,
							y: event.pageY,
							row: log,
						});
					}}>
					<IconDotsVertical stroke={1.2} size={'0.8rem'} color="#545beb" />
				</div>
			)}
			<span>
				{_.isObject(log) ? (
					_.map(log, (value, key) => {
						//skiping fields with empty strings
						if (!_.toString(value)) return;
						const isTimestamp = _.get(fieldTypeMap, key, null) === 'timestamp';
						const sanitizedValue = isTimestamp ? `${formatLogTs(_.toString(value))} (${localTz})` : _.toString(value);
						return (
							<Item
								header={key}
								key={key}
								value={sanitizedValue}
								highlight={disableHighlight ? false : shouldHighlight(key, value)}
							/>
						);
					})
				) : (
					<Item
						header={null}
						value={_.toString(log)}
						highlight={disableHighlight ? false : shouldHighlight(null, _.toString(log))}
					/>
				)}
			</span>
			{isSecureHTTPContext ? <CopyIcon value={log} /> : null}
		</Stack>
	);
};

const JsonRows = (props: { isSearching: boolean; setContextMenu: any }) => {
	const [{ pageData, instantSearchValue, rowNumber }, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const disableHighlight = props.isSearching || _.isEmpty(instantSearchValue) || isJqSearch(instantSearchValue);

	const shouldHighlight = useCallback(
		(header: string | null, val: number | string | Date | null) => {
			return String(val).includes(instantSearchValue) || String(header).includes(instantSearchValue);
		},
		[instantSearchValue],
	);

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
		<Stack gap={0} style={{ flex: 1 }}>
			{_.map(pageData, (d, index) => (
				<div
					key={index}
					onClick={(event) => {
						event.preventDefault();
						handleRowClick(index, event);
					}}>
					<Row
						log={d}
						key={index}
						searchValue={instantSearchValue}
						disableHighlight={disableHighlight}
						shouldHighlight={shouldHighlight}
						isRowHighlighted={isRowHighlighted(index, rowNumber)}
						showEllipses={isFirstRowInRange(index, rowNumber)}
						setContextMenu={props.setContextMenu}
					/>
				</div>
			))}
		</Stack>
	);
};

const Toolbar = ({
	isSearching,
	setSearching,
}: {
	isSearching: boolean;
	setSearching: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [localSearchValue, setLocalSearchValue] = useState<string>('');
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [searchValue, setLogsStore] = useLogsStore((store) => store.tableOpts.instantSearchValue);
	const [{ rawData, filteredData }] = useLogsStore((store) => store.data);

	const debouncedSearch = useCallback(
		_.debounce(async (val: string) => {
			if (val.trim() === '') {
				setLogsStore((store) => setInstantSearchValue(store, ''));
				setLogsStore(applyInstantSearch);
			} else {
				const isJq = isJqSearch(val);
				if (isJq) {
					const jqResult = await jqSearch(rawData, val);
					setLogsStore((store) => applyJqSearch(store, jqResult));
				} else {
					setLogsStore(applyInstantSearch);
				}
			}
			setSearching(false);
		}, 500),
		[rawData],
	);

	const handleSearch = useCallback(() => {
		if (localSearchValue.trim()) {
			setSearching(true);
			setLogsStore((store) => setInstantSearchValue(store, localSearchValue));
			debouncedSearch(localSearchValue);
		}
	}, [localSearchValue, debouncedSearch, setSearching]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setLocalSearchValue(value);
			if (value.trim() === '') {
				debouncedSearch(value);
			}
		},
		[debouncedSearch],
	);

	useHotkeys([['mod+K', () => searchInputRef.current?.focus()]]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter' && !isSearching && localSearchValue.trim()) {
				handleSearch();
			}
		},
		[isSearching, localSearchValue],
	);

	if (_.isEmpty(rawData)) return null;

	const inputStyles = {
		'--input-left-section-width': '2rem',
		'--input-right-section-width': '6rem',
		width: '100%',
	} as React.CSSProperties;

	return (
		<div className={classes.headerWrapper}>
			<TextInput
				leftSection={isSearching ? <Loader size="sm" /> : <IconSearch stroke={2.5} size="0.9rem" />}
				placeholder="Search loaded data with text or jq. For jq input try `jq .[]`"
				value={localSearchValue}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				ref={searchInputRef}
				classNames={{ input: classes.inputField }}
				style={inputStyles}
				rightSection={
					searchValue && !isSearching ? (
						<Text style={{ fontSize: '0.7rem', textAlign: 'end' }} lineClamp={1}>
							{filteredData.length} Matches
						</Text>
					) : null
				}
			/>
			<Button
				onClick={handleSearch}
				disabled={!localSearchValue.trim() || isSearching}
				style={{ width: '10%' }}
				leftSection={<IconSearch stroke={2.5} size="0.9rem" />}>
				Search
			</Button>
		</div>
	);
};

const TableContainer = (props: { children: ReactNode }) => {
	return <Box className={classes.container}>{props.children}</Box>;
};

const JsonView = (props: {
	errorMessage: AxiosError;
	hasNoData: boolean;
	showTable: boolean;
	isFetchingCount: boolean;
}) => {
	const [maximized] = useAppStore((store) => store.maximized);
	const [contextMenu, setContextMenu] = useState<ContextMenuState>({
		visible: false,
		x: 0,
		y: 0,
		row: null,
	});

	const contextMenuRef = useRef<HTMLDivElement>(null);
	const { errorMessage, hasNoData, showTable, isFetchingCount } = props;
	const [isSearching, setSearching] = useState(false);
	const [rowNumber, setLogsStore] = useLogsStore((store) => store.tableOpts.rowNumber);
	const [pageData] = useLogsStore((store) => store.tableOpts.pageData);
	const [isSecureHTTPContext] = useAppStore((store) => store.isSecureHTTPContext);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;

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

	const selectLog = useCallback((log: Log | null) => {
		if (!log) return;
		const selectedText = window.getSelection()?.toString();
		if (selectedText !== undefined && selectedText?.length > 0) return;

		setLogsStore((store) => setSelectedLog(store, log));
	}, []);

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

	return (
		<TableContainer>
			<Toolbar isSearching={isSearching} setSearching={setSearching} />
			{!errorMessage ? (
				showTable ? (
					<Box className={classes.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={classes.innerContainer}
							style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
							<Stack gap={0} style={{ width: '100%' }}>
								<Stack style={{ overflowY: 'scroll' }}>
									<JsonRows isSearching={isSearching} setContextMenu={setContextMenu} />
								</Stack>
							</Stack>
						</Box>
						{contextMenu.visible && (
							<div
								ref={contextMenuRef}
								style={{
									top: contextMenu.y,
									left: contextMenu.x,
								}}
								className={classes.contextMenuContainer}
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
									{isSecureHTTPContext && (
										<>
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
										</>
									)}
								</Menu>
							</div>
						)}
					</Box>
				) : hasNoData ? (
					<>
						<EmptyBox message="No Matching Rows" />
					</>
				) : (
					<LoadingView />
				)
			) : (
				<ErrorView message={(errorMessage?.response?.data as string) || 'Failed to query logs'} />
			)}
			<Footer loaded={showTable} hasNoData={hasNoData} isFetchingCount={isFetchingCount} />
		</TableContainer>
	);
};

export default JsonView;
