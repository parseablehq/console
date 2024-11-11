import { Box } from '@mantine/core';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import JsonView from './JSONView';
import LogTable from './StaticLogTable';
import useLogsFetcher from './useLogsFetcher';
import LogsViewConfig from './LogsViewConfig';
import _ from 'lodash';

import { useEffect } from 'react';

const { setPageAndPageData, setTargetPage } = logsStoreReducers;

const LogsView = (props: { schemaLoading: boolean; infoLoading: boolean }) => {
	const { schemaLoading, infoLoading } = props;
	const { errorMessage, hasNoData, showTable, isFetchingCount, logsLoading } = useLogsFetcher({
		schemaLoading,
		infoLoading,
	});

	const [tableOpts] = useLogsStore((store) => store.tableOpts);
	const { currentPage, targetPage } = tableOpts;
	const [viewMode, setLogsStore] = useLogsStore((store) => store.viewMode);
	const viewOpts = {
		errorMessage,
		hasNoData,
		showTable,
		isFetchingCount,
		logsLoading,
	};

	useEffect(() => {
		if (!showTable) return;
		if (targetPage) {
			console.log('hello');
			setLogsStore((store) => setPageAndPageData(store, targetPage));
			setLogsStore((store) => setTargetPage(store, undefined));
		}
	}, [currentPage]);

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
