import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect, useMemo } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { useFetchCount } from '@/hooks/useQueryResult';

const { setCleanLogStoreForStreamChange } = logsStoreReducers;

const useLogsFetcher = (props: { schemaLoading: boolean }) => {
	const { schemaLoading } = props;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ tableOpts }, setLogsStore] = useLogsStore((store) => store);

	useMemo(() => {
		setLogsStore(setCleanLogStoreForStreamChange);
	}, [currentStream]);

	const { currentOffset, currentPage, pageData } = tableOpts;
	const { getQueryData, loading: logsLoading, error: errorMessage } = useQueryLogs();
	const { refetchCount, isCountLoading, isCountRefetching } = useFetchCount();
	const hasContentLoaded = schemaLoading === false && logsLoading === false;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	useEffect(() => {
		if (currentPage === 0 && currentOffset === 0) {
			getQueryData();
			refetchCount();
		}
	}, [currentPage, currentStream]);

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
		isFetchingCount: isCountLoading || isCountRefetching,
	};
};

export default useLogsFetcher;
