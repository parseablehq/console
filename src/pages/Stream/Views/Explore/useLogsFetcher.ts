import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';

const { setCleanStoreForStreamChange } = logsStoreReducers;

const useLogsFetcher = (props: {schemaLoading: boolean}) => {
	const {schemaLoading} = props;
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [tableOpts, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const { currentOffset, currentPage, pageData } = tableOpts;
	const { getQueryData, loading: logsLoading, error: errorMessage, fetchCount, isFetchingCount } = useQueryLogs();
	const hasContentLoaded = schemaLoading === false && logsLoading === false;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;
	const {getDataSchema} = useGetLogStreamSchema()

	useEffect(() => {
		setLogsStore(setCleanStoreForStreamChange);
	}, [currentStream]);

	useEffect(() => {
		if (currentPage === 0 && currentOffset === 0) {
			getDataSchema();
			getQueryData();
			fetchCount();
		}
	}, [currentPage]);

	useEffect(() => {
		if (currentOffset !== 0 && currentPage !== 0) {
			getQueryData();
		}
	}, [currentOffset]);

	return { logsLoading, errorMessage, isFetchingCount, hasContentLoaded, hasNoData, showTable };
};

export default useLogsFetcher;
