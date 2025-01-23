import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { useFetchCount } from '@/hooks/useQueryResult';
import useParamsController from '@/pages/Stream/hooks/useParamsController';
import _ from 'lodash';

const { setCleanStoreForStreamChange } = logsStoreReducers;
const { syncTimeRange } = appStoreReducers;

const useLogsFetcher = (props: { schemaLoading: boolean; infoLoading: boolean }) => {
	const { isStoreSynced } = useParamsController();
	const { schemaLoading, infoLoading } = props;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ timeRange }, setAppStore] = useAppStore((store) => store);
	const [{ tableOpts }, setLogsStore] = useLogsStore((store) => store);
	const { currentOffset, currentPage, pageData } = tableOpts;
	const { getQueryData, loading: logsLoading, queryLogsError } = useQueryLogs();

	const { refetchCount, countLoading } = useFetchCount();
	const hasContentLoaded = schemaLoading === false && logsLoading === false;
	const hasNoData = hasContentLoaded && !queryLogsError && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !queryLogsError;

	useEffect(() => {
		if (!isStoreSynced) return;
		setAppStore(syncTimeRange);
		setLogsStore(setCleanStoreForStreamChange);
	}, [currentStream]);

	useEffect(() => {
		if (infoLoading) return;

		if (currentPage === 0) {
			getQueryData();
			refetchCount();
		}
	}, [currentPage, currentStream, timeRange, infoLoading]);

	useEffect(() => {
		if (infoLoading) return;

		if (currentOffset !== 0 && currentPage !== 0) {
			getQueryData();
		}
	}, [currentOffset, infoLoading]);

	return {
		logsLoading: infoLoading || logsLoading,
		queryLogsError,
		hasContentLoaded,
		hasNoData,
		showTable,
		isFetchingCount: countLoading,
	};
};

export default useLogsFetcher;
