import { Box, Stack, Text } from '@mantine/core';
import { ReactNode, useEffect, useRef, useState } from 'react';
import classes from '../../styles/JSONView.module.css';
import EmptyBox from '@/components/Empty';
import { ErrorView, LoadingView } from './LoadingViews';
import Footer from './Footer';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT, LOGS_SECONDARY_TOOLBAR_HEIGHT, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { columnsToSkip, useLogsStore } from '../../providers/LogsProvider';
import { Log } from '@/@types/parseable/api/query';
import _ from 'lodash';

const Container = (props: { children: ReactNode }) => {
	return (
		<Stack style={{ flex: 1 }} gap={0}>
			{props.children}
		</Stack>
	);
};

const Item = (props: { header: string; value: number | string | Date | null }) => {
	return (
		<span className={classes.itemContainer}>
			<span className={classes.itemHeader}>{props.header}: </span>
			<span className={classes.itemValue}>{props.value} </span>
		</span>
	);
};

const Row = (props: { log: Log; headers: string[] }) => {
	const { log, headers } = props;
	return (
		<Stack style={{ flexDirection: 'row' }} className={classes.rowContainer} gap={0}>
			<span>
				{_.map(headers, (header) => (_.has(log, header) ? <Item header={header} value={log[header]} /> : null))}
			</span>
		</Stack>
	);
};

const JsonRows = () => {
	const [{ pageData, headers }] = useLogsStore((store) => store.tableOpts);
	const sanitizedHeaders = _.without(headers, ...columnsToSkip);

	return (
		<Stack gap={0}>
			{_.map(pageData, (d, index) => (
				<Row log={d} key={index} headers={sanitizedHeaders} />
			))}
		</Stack>
	);
};

const Content = () => {
	const [maximized] = useAppStore((store) => store.maximized);

	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;
	return (
		<Box className={classes.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
			<Box
				className={classes.innerContainer}
				style={{
					display: 'flex',
					flexDirection: 'row',
					maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
					flex: 1,
					overflowY: 'scroll',
				}}>
				<JsonRows />
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
	return (
		<Container>
			{!errorMessage ? (
				showTable ? (
					<Content />
				) : hasNoData ? (
					<EmptyBox message="No Matching Rows" />
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
