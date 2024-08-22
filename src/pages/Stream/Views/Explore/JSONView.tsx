import { Box, Loader, Stack, Text, TextInput } from '@mantine/core';
import { ChangeEvent, ReactNode, useCallback, useRef, useState } from 'react';
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
import { columnsToSkip, useLogsStore, logsStoreReducers, isJqSearch } from '../../providers/LogsProvider';
import { Log } from '@/@types/parseable/api/query';
import _ from 'lodash';
import jqSearch from '@/utils/jqSearch';
import { IconCheck, IconCopy, IconSearch } from '@tabler/icons-react';

const { setInstantSearchValue, applyInstantSearch, applyJqSearch } = logsStoreReducers;

const Item = (props: { header: string | null; value: string; highlight: boolean }) => {
	return (
		<span className={classes.itemContainer}>
			{props.header && <span className={classes.itemHeader}>{props.header}: </span>}
			<span className={classes.itemValue}>
				<span style={{ background: props.highlight ? 'yellow' : 'transparent' }}>{props.value}</span>{' '}
			</span>
		</span>
	);
};

const CopyIcon = (props: { log: Log }) => {
	const copyIconRef = useRef<HTMLDivElement>(null);
	const copiedIconRef = useRef<HTMLDivElement>(null);

	const onCopy = async () => {
		if (copyIconRef.current && copiedIconRef.current) {
			copyIconRef.current.style.display = 'none';
			copiedIconRef.current.style.display = 'flex';
		}
		await navigator.clipboard.writeText(JSON.stringify(props.log, null, 2));
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
				<IconCopy stroke={1.2} size={'1rem'} />
			</Box>
			<Box ref={copiedIconRef} style={{ display: 'none', color: 'green' }}>
				<IconCheck stroke={1.2} size={'1rem'} />
			</Box>
		</Stack>
	);
};

const Row = (props: {
	log: Log;
	headers: string[];
	searchValue: string;
	disableHighlight: boolean;
	shouldHighlight: (val: number | string | Date | null) => boolean;
}) => {
	const { log, headers, disableHighlight, shouldHighlight } = props;

	return (
		<Stack style={{ flexDirection: 'row' }} className={classes.rowContainer} gap={0}>
			<span>
				{_.isObject(log) ? (
					_.map(headers, (header, index) => {
						if (!_.toString(log[header])) return;

						return (
							<Item
								header={header}
								key={index}
								value={_.toString(log[header])}
								highlight={disableHighlight ? false : shouldHighlight(log[header])}
							/>
						);
					})
				) : (
					<Item
						header={null}
						value={_.toString(log)}
						highlight={disableHighlight ? false : shouldHighlight(_.toString(log))}
					/>
				)}
			</span>
			<CopyIcon log={log} />
		</Stack>
	);
};

const JsonRows = (props: { isSearching: boolean }) => {
	const [{ pageData, headers, instantSearchValue }] = useLogsStore((store) => store.tableOpts);
	const sanitizedHeaders = _.without(headers, ...columnsToSkip);
	const disableHighlight = props.isSearching || _.isEmpty(instantSearchValue) || isJqSearch(instantSearchValue);
	const regExp = disableHighlight ? null : new RegExp(instantSearchValue, 'i');

	const shouldHighlight = useCallback(
		(val: number | string | Date | null) => {
			return !!regExp?.test(_.toString(val));
		},
		[regExp],
	);

	return (
		<Stack gap={0} style={{ flex: 1 }}>
			{_.map(pageData, (d, index) => (
				<Row
					log={d}
					key={index}
					headers={sanitizedHeaders}
					searchValue={instantSearchValue}
					disableHighlight={disableHighlight}
					shouldHighlight={shouldHighlight}
				/>
			))}
		</Stack>
	);
};

const Toolbar = (props: { isSearching: boolean; setSearching: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const { isSearching, setSearching } = props;
	const [searchValue, setLogsStore] = useLogsStore((store) => store.tableOpts.instantSearchValue);
	const [{ rawData, filteredData }] = useLogsStore((store) => store.data);

	const debouncedSearch = useCallback(
		_.debounce(async (val: string) => {
			const isJq = isJqSearch(val);
			if (isJq) {
				const jqResult = await jqSearch(rawData, val);
				setLogsStore((store) => applyJqSearch(store, jqResult));
			} else {
				setLogsStore(applyInstantSearch);
			}
			setSearching(false);
		}, 1000),
		[rawData],
	);

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setLogsStore((store) => setInstantSearchValue(store, e.target.value));
		debouncedSearch(e.target.value);
		setSearching(true);
	}, []);

	if (_.isEmpty(rawData)) return null;

	return (
		<Stack style={{ height: 50, padding: '1rem', width: '100%', justifyContent: 'center' }}>
			<TextInput
				leftSection={isSearching ? <Loader size="sm" /> : <IconSearch stroke={2.5} size="0.9rem" />}
				placeholder="Search loaded data with text or jq. For jq input try `jq .[]`"
				value={searchValue}
				onChange={onChange}
				style={{ '--input-left-section-width': '2rem', '--input-right-section-width': '6rem' }}
				rightSection={
					!_.isEmpty(searchValue) &&
					!isSearching && (
						<Text style={{ fontSize: '0.7rem', textAlign: 'end' }} lineClamp={1}>
							{_.size(filteredData)} Matches
						</Text>
					)
				}
			/>
		</Stack>
	);
};

const TableContainer = (props: { children: ReactNode }) => {
	return <Box className={classes.container}>{props.children}</Box>;
};

const JsonView = (props: {
	errorMessage: string | null;
	hasNoData: boolean;
	showTable: boolean;
	isFetchingCount: boolean;
}) => {
	const [maximized] = useAppStore((store) => store.maximized);

	const { errorMessage, hasNoData, showTable, isFetchingCount } = props;
	const [isSearching, setSearching] = useState(false);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;

	return (
		<TableContainer>
			<Toolbar isSearching={isSearching} setSearching={setSearching} />
			{!errorMessage ? (
				showTable ? (
					<Box className={classes.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={classes.innerContainer}
							style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
							<Stack gap={0}>
								<Stack style={{ overflowY: 'scroll' }}>
									<JsonRows isSearching={isSearching} />
								</Stack>
							</Stack>
						</Box>
					</Box>
				) : hasNoData ? (
					<>
						<EmptyBox message="No Matching Rows" />
					</>
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

export default JsonView;
