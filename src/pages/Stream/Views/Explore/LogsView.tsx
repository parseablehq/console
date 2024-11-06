import { Box } from '@mantine/core';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import JsonView from './JSONView';
import LogTable from './StaticLogTable';
import useLogsFetcher from './useLogsFetcher';
import LogsViewConfig from './LogsViewConfig';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';

const { setPageAndPageData, setCurrentPage } = logsStoreReducers;

const LogsView = (props: { schemaLoading: boolean; infoLoading: boolean }) => {
	const [searchParams] = useSearchParams();
	const [targetPage, setTargetPage] = useState<string | null>(null);
	const { schemaLoading, infoLoading } = props;
	const { errorMessage, hasNoData, showTable, isFetchingCount, logsLoading } = useLogsFetcher({
		schemaLoading,
		infoLoading,
	});

	const [viewMode, setLogsStore] = useLogsStore((store) => store.viewMode);
	const viewOpts = {
		errorMessage,
		hasNoData,
		showTable,
		isFetchingCount,
		logsLoading,
	};
	useEffect(() => {
		setTargetPage(searchParams.get('page'));
		if (showTable && (targetPage !== null || undefined || '0')) {
			setLogsStore((store) => setPageAndPageData(store, _.toNumber(targetPage)));
			setLogsStore((store) => setCurrentPage(store, _.toNumber(targetPage)));
		}
	}, [showTable]);

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
