import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { useFetchCount } from '@/hooks/useQueryResult';
import { useStreamStore } from '../../providers/StreamProvider';

const { setCleanStoreForStreamChange } = logsStoreReducers;
const { syncTimeRange } = appStoreReducers;

const useLogsFetcher = (props: { schemaLoading: boolean; infoLoading: boolean }) => {
	const { schemaLoading, infoLoading } = props;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ timeRange }, setAppStore] = useAppStore((store) => store);
	const [{ tableOpts }, setLogsStore] = useLogsStore((store) => store);
	const { currentOffset, currentPage, pageData } = tableOpts;
	const { getQueryData, loading: logsLoading, error: errorMessage } = useQueryLogs();
	const [{ info }] = useStreamStore((store) => store);
	const firstEventAt = 'first-event-at' in info ? info['first-event-at'] : undefined;

	const { refetchCount, isCountLoading, isCountRefetching } = useFetchCount();
	const hasContentLoaded = schemaLoading === false && logsLoading === false;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	useEffect(() => {
		setAppStore(syncTimeRange);
		setLogsStore(setCleanStoreForStreamChange);
	}, [currentStream]);

	useEffect(() => {
		if (infoLoading || !firstEventAt) return;

		if (currentPage === 0) {
			getQueryData();
			refetchCount();
		}
	}, [currentPage, currentStream, timeRange, infoLoading, firstEventAt]);

	useEffect(() => {
		if (infoLoading || !firstEventAt) return;

		if (currentOffset !== 0 && currentPage !== 0) {
			getQueryData();
		}
	}, [currentOffset, infoLoading, firstEventAt]);

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
