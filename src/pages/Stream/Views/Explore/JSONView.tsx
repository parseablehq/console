import { Box, Loader, Stack, Text, TextInput } from '@mantine/core';
import { ChangeEvent, ReactNode, useCallback, useState } from 'react';
import classes from '../../styles/JSONView.module.css';
import EmptyBox from '@/components/Empty';
import { ErrorView, LoadingView } from './LoadingViews';
import Footer from './Footer';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import {
	LOGS_PRIMARY_TOOLBAR_HEIGHT,
	JSON_VIEW_TOOLBAR_HEIGHT,
	LOGS_SECONDARY_TOOLBAR_HEIGHT,
	PRIMARY_HEADER_HEIGHT,
} from '@/constants/theme';
import { columnsToSkip, useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { Log } from '@/@types/parseable/api/query';
import _ from 'lodash';
import jqSearch from '@/utils/jqSearch';
import { IconSearch } from '@tabler/icons-react';

const { setInstantSearchValue, applyInstantSearch, applyJqSearch } = logsStoreReducers;

const Container = (props: { children: ReactNode }) => {
	return (
		<Stack style={{ flex: 1 }} gap={0}>
			{props.children}
		</Stack>
	);
};

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
					_.map(headers, (header, index) => (
						<Item
							header={header}
							key={index}
							value={_.toString(log[header])}
							highlight={disableHighlight ? false : shouldHighlight(log[header])}
						/>
					))
				) : (
					<Item
						header={null}
						value={_.toString(log)}
						highlight={disableHighlight ? false : shouldHighlight(_.toString(log))}
					/>
				)}
			</span>
		</Stack>
	);
};

const JsonRows = (props: { isSearching: boolean }) => {
	const [{ pageData, headers, instantSearchValue }] = useLogsStore((store) => store.tableOpts);
	const sanitizedHeaders = _.without(headers, ...columnsToSkip);
	const disableHighlight = props.isSearching || _.isEmpty(instantSearchValue) || _.startsWith(instantSearchValue, '.');
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
			const isJqSearch = _.startsWith(val, '.');
			if (isJqSearch) {
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
				placeholder="Search Placeholder"
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

const Content = (props: { isSearching: boolean }) => {
	const [maximized] = useAppStore((store) => store.maximized);

	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT + JSON_VIEW_TOOLBAR_HEIGHT
		: 0;
	return (
		<Box className={classes.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
			<Box
				className={classes.innerContainer}
				style={{
					display: 'flex',
					flexDirection: 'column',
					maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
					flex: 1,
					overflowY: 'scroll',
				}}>
				<JsonRows isSearching={props.isSearching} />
			</Box>
		</Box>
	);
};

const JsonView = (props: {
	isFetchingCount: boolean;
	errorMessage: string | null;
	hasNoData: boolean;
	showTable: boolean;
}) => {
	const { isFetchingCount, errorMessage, hasNoData, showTable } = props;
	const [isSearching, setSearching] = useState(false);

	return (
		<Container>
			{!errorMessage ? (
				showTable ? (
					<>
						<Toolbar isSearching={isSearching} setSearching={setSearching} />
						<Content isSearching={isSearching} />
					</>
				) : hasNoData ? (
					<>
						<Toolbar isSearching={isSearching} setSearching={setSearching} />
						<EmptyBox message="No Matching Rows" />
					</>
				) : (
					<LoadingView />
				)
			) : (
				<ErrorView message={errorMessage} />
			)}
			<Footer loaded={showTable} isLoading={isFetchingCount} hasNoData={hasNoData} />
		</Container>
	);
};

export default JsonView;
