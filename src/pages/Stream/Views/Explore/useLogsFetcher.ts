import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { useQueryResult } from '@/hooks/useQueryResult';

const { setCleanStoreForStreamChange } = logsStoreReducers;

const useLogsFetcher = (props: { schemaLoading: boolean }) => {
	const { schemaLoading } = props;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ tableOpts, timeRange }, setLogsStore] = useLogsStore((store) => store);
	const { currentOffset, currentPage, pageData } = tableOpts;
	const { getQueryData, loading: logsLoading, error: errorMessage } = useQueryLogs();
	const { useFetchFooterCount } = useQueryResult();
	const { footerCountRefetch, footerCountLoading, footerCountRefetching } = useFetchFooterCount();
	const hasContentLoaded = schemaLoading === false && logsLoading === false;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	useEffect(() => {
		setLogsStore(setCleanStoreForStreamChange);
	}, [currentStream]);

	useEffect(() => {
		if (currentPage === 0 && currentOffset === 0) {
			getQueryData();
			footerCountRefetch();
		}
	}, [currentPage, currentStream, timeRange]);

	useEffect(() => {
		if (currentOffset !== 0 && currentPage !== 0) {
			getQueryData();
		}
	}, [currentOffset]);

	return {
		logsLoading,
		errorMessage,
		hasContentLoaded,
		hasNoData,
		showTable,
		footerCountLoading,
		footerCountRefetching,
	};
};

export default useLogsFetcher;
