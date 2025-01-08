import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { useFetchCount } from '@/hooks/useQueryResult';

const { setCleanStoreForStreamChange } = logsStoreReducers;
const { syncTimeRange } = appStoreReducers;

const useLogsFetcher = (props: { infoLoading: boolean }) => {
	const { infoLoading } = props;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ timeRange }, setAppStore] = useAppStore((store) => store);
	const [{ tableOpts }, setLogsStore] = useLogsStore((store) => store);
	const { currentOffset, currentPage, pageData, totalCount } = tableOpts;
	const { getQueryData, loading: logsLoading, error: errorMessage } = useQueryLogs();

	const { refetchCount, isCountLoading, isCountRefetching } = useFetchCount();
	const hasContentLoaded = !isCountLoading && !logsLoading && !isCountRefetching;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	useEffect(() => {
		setAppStore(syncTimeRange);
		setLogsStore(setCleanStoreForStreamChange);
		refetchCount();
	}, [currentStream]);

	useEffect(() => {
		if (infoLoading || totalCount === 0) return;

		if (currentPage === 0) {
			getQueryData();
		}
	}, [currentPage, currentStream, timeRange, infoLoading, totalCount]);

	useEffect(() => {
		if (infoLoading || totalCount === 0) return;

		if (currentOffset !== 0 && currentPage !== 0) {
			getQueryData();
		}
	}, [currentOffset, infoLoading, totalCount]);

	return {
		logsLoading: infoLoading || logsLoading,
		errorMessage,
		hasContentLoaded,
		hasNoData,
		showTable,
		isFetchingCount: isCountLoading || isCountRefetching,
	};
};

export default useLogsFetcher;
