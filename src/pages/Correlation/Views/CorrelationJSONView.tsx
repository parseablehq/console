import { Box, Stack } from '@mantine/core';
import { ErrorView, LoadingView } from '@/pages/Stream/Views/Explore/LoadingViews';
import { IconCheck, IconCopy, IconDotsVertical } from '@tabler/icons-react';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { formatLogTs, isJqSearch } from '@/pages/Stream/providers/LogsProvider';

import EmptyBox from '@/components/Empty';
import { Log } from '@/@types/parseable/api/query';
import _ from 'lodash';
import classes from '../../Stream/styles/JSONView.module.css';
import { copyTextToClipboard } from '@/utils';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCorrelationStore } from '../providers/CorrelationProvider';

type ContextMenuState = {
	visible: boolean;
	x: number;
	y: number;
	row: Log | null;
};

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
						const fieldTypeMap = {
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
						};
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
	const [{ pageData, instantSearchValue }] = useCorrelationStore((store) => store.tableOpts);
	const disableHighlight = props.isSearching || _.isEmpty(instantSearchValue) || isJqSearch(instantSearchValue);

	const shouldHighlight = useCallback(
		(header: string | null, val: number | string | Date | null) => {
			return String(val).includes(instantSearchValue) || String(header).includes(instantSearchValue);
		},
		[instantSearchValue],
	);

	return (
		<Stack gap={0} style={{ flex: 1 }}>
			{_.map(pageData, (d, index) => (
				<Row
					log={d}
					key={index}
					searchValue={instantSearchValue}
					disableHighlight={disableHighlight}
					shouldHighlight={shouldHighlight}
					isRowHighlighted={false}
					showEllipses={false}
					setContextMenu={props.setContextMenu}
				/>
			))}
		</Stack>
	);
};

const TableContainer = (props: { children: ReactNode }) => {
	return <Box className={classes.container}>{props.children}</Box>;
};

const CorrleationJSONView = (props: { errorMessage: string | null; hasNoData: boolean; showTable: boolean }) => {
	const [maximized] = useAppStore((store) => store.maximized);
	const [contextMenu, setContextMenu] = useState<ContextMenuState>({
		visible: false,
		x: 0,
		y: 0,
		row: null,
	});

	const contextMenuRef = useRef<HTMLDivElement>(null);
	const { errorMessage, hasNoData, showTable } = props;
	const [isSearching] = useState(false);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;

	// const showTableOrLoader = logsLoading || streamsLoading || showTable || !errorMessage || !hasNoData;

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

	return (
		<TableContainer>
			{/* <Toolbar isSearching={isSearching} setSearching={setSearching} /> */}
			{!errorMessage ? (
				showTable ? (
					<Box className={classes.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={classes.innerContainer}
							style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
							<Stack gap={0} style={{ width: '100%' }}>
								<Stack>
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
								onClick={closeContextMenu}></div>
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
				<ErrorView message={errorMessage || 'Failed to query logs'} />
			)}
		</TableContainer>
	);
};

export default CorrleationJSONView;
