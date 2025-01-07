import { Box } from '@mantine/core';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import JsonView from './JSONView';
import LogTable from './StaticLogTable';
import useLogsFetcher from './useLogsFetcher';
import LogsViewConfig from './LogsViewConfig';
import { useFilterStore, filterStoreReducers } from '../../providers/FilterProvider';

import { useEffect } from 'react';
import _ from 'lodash';
import { AxiosError } from 'axios';

const { setPageAndPageData, setTargetPage, setTargetColumns, setDisabledColumns } = logsStoreReducers;
const { toogleQueryParamsFlag } = filterStoreReducers;

const LogsView = (props: { schemaLoading: boolean; infoLoading: boolean }) => {
	const [, setFilterStore] = useFilterStore((store) => store);
	const { schemaLoading, infoLoading } = props;
	const { hasNoData, showTable, isFetchingCount, logsLoading, queryLogsError } = useLogsFetcher({
		schemaLoading,
		infoLoading,
	});

	const [tableOpts] = useLogsStore((store) => store.tableOpts);
	const { currentPage, targetPage, headers, targetColumns } = tableOpts;
	const [viewMode, setLogsStore] = useLogsStore((store) => store.viewMode);
	const viewOpts = {
		errorMessage: queryLogsError as AxiosError,
		hasNoData,
		showTable,
		isFetchingCount,
		logsLoading,
	};

	useEffect(() => {
		if (!showTable) return;
		if (targetPage) {
			setLogsStore((store) => setPageAndPageData(store, targetPage));
			if (currentPage === targetPage) {
				setLogsStore((store) => setTargetPage(store, undefined));
			}
		}
		if (showTable) setFilterStore((store) => toogleQueryParamsFlag(store, false));
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
