import { Box } from '@mantine/core';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import JsonView from './JSONView';
import LogTable from './StaticLogTable';
import useLogsFetcher from './useLogsFetcher';
import LogsViewConfig from './LogsViewConfig';
import _ from 'lodash';
import { getOffset } from '@/utils';

import { useEffect } from 'react';

const { setPageAndPageData, setTargetPage, setTargetColumns, setDisabledColumns, setCurrentOffset } = logsStoreReducers;

const LogsView = (props: { schemaLoading: boolean; infoLoading: boolean }) => {
	const { schemaLoading, infoLoading } = props;
	const { errorMessage, hasNoData, showTable, isFetchingCount, logsLoading } = useLogsFetcher({
		schemaLoading,
		infoLoading,
	});

	const [tableOpts] = useLogsStore((store) => store.tableOpts);
	const { currentPage, targetPage, headers, targetColumns, perPage } = tableOpts;
	const [viewMode, setLogsStore] = useLogsStore((store) => store.viewMode);
	const viewOpts = {
		errorMessage,
		hasNoData,
		showTable,
		isFetchingCount,
		logsLoading,
	};

	useEffect(() => {
		console.log(showTable);
		if (!showTable) return;
		if (targetPage) {
			const offset = getOffset(targetPage, perPage);
			if (offset > 0) {
				setLogsStore((store) => setCurrentOffset(store, offset));
				console.log(targetPage - offset / perPage);
				setLogsStore((store) => setTargetPage(store, targetPage - offset / perPage));
			}
			setLogsStore((store) => setPageAndPageData(store, targetPage));
			if (currentPage === targetPage) {
				setLogsStore((store) => setTargetPage(store, undefined));
			}
		}
	}, [showTable, currentPage]);

	useEffect(() => {
		if (!showTable) return;
		if (!_.isEmpty(targetColumns)) {
			setLogsStore((store) =>
				setDisabledColumns(
					store,
					headers.filter((el) => !targetColumns.includes(el)),
				),
			);
			setLogsStore((store) => setTargetColumns(store, []));
		}
	}, [headers]);

	return (
		<Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
			{viewMode === 'table' && (
				<LogsViewConfig schemaLoading={schemaLoading} logsLoading={logsLoading} infoLoading={infoLoading} />
			)}
			{viewMode === 'table' ? <LogTable {...viewOpts} /> : <JsonView {...viewOpts} />}
		</Box>
	);
};

export default LogsView;
