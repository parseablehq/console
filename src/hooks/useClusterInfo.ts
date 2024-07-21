import { useMutation, useQuery } from 'react-query';
import { AxiosError, AxiosResponse, isAxiosError } from 'axios';
import { getClusterInfo, getClusterMetrics, deleteIngestor, getIngestorInfo } from '@/api/cluster';
import { Ingestor, IngestorMetrics, IngestorQueryRecord } from '@/@types/parseable/api/clusterInfo';
import { notifyError, notifySuccess } from '@/utils/notification';
import { useClusterStore, clusterStoreReducers } from '@/pages/Systems/providers/ClusterProvider';

const { setIngestorMachines, setCurrentMachineData } = clusterStoreReducers;

export const useClusterInfo = () => {
	const [, setClusterStore] = useClusterStore((_store) => null);
	const {
		data: clusterInfoData,
		isError: getClusterInfoError,
		isSuccess: getClusterInfoSuccess,
		isLoading: getClusterInfoLoading,
		refetch: getClusterInfoRefetch,
	} = useQuery<AxiosResponse<Ingestor[]>, Error>(['fetch-cluster-info'], () => getClusterInfo(), {
		retry: false,
		refetchOnWindowFocus: false,
		enabled: false,
		onSuccess: (data) => {
			setClusterStore((store) => setIngestorMachines(store, data.data));
		},
	});
	return {
		clusterInfoData,
		getClusterInfoError,
		getClusterInfoSuccess,
		getClusterInfoLoading,
		getClusterInfoRefetch,
	};
};

export const useClusterMetrics = () => {
	const {
		data: clusterMetrics,
		isError: getClusterMetricsError,
		isSuccess: getClusterMetricsSuccess,
		isLoading: getClusterMetricsLoading,
		refetch: getClusterMetricsRefetch,
	} = useQuery<AxiosResponse<IngestorMetrics[]>>(['fetch-cluster-metrics'], () => getClusterMetrics(), {
		retry: false,
		refetchOnWindowFocus: false,
	});
	return {
		clusterMetrics,
		getClusterMetricsError,
		getClusterMetricsSuccess,
		getClusterMetricsLoading,
		getClusterMetricsRefetch,
	};
};

export const useDeleteIngestor = () => {
	const {
		mutate: deleteIngestorMutation,
		isSuccess: deleteIngestorIsSuccess,
		isError: deleteIngestorIsError,
		isLoading: deleteIngestorIsLoading,
	} = useMutation((data: { ingestorUrl: string; onSuccess: () => void }) => deleteIngestor(data.ingestorUrl), {
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response.data as string;
				typeof error === 'string' && notifyError({ message: error });
			}
		},
		onSuccess: (_data, variables) => {
			variables.onSuccess && variables.onSuccess();
			notifySuccess({ message: 'Ingestor removed successfully' });
		},
	});

	return {
		deleteIngestorMutation,
		deleteIngestorIsSuccess,
		deleteIngestorIsError,
		deleteIngestorIsLoading,
	};
};

export const useGetIngestorInfo = () => {
	const [clusterStore, setClusterStore] = useClusterStore((store) => store);
	const { currentMachine, currentMachineType } = clusterStore;
	const now = new Date();
	const startOfMinute = new Date(now.setSeconds(0, 0));
	const startTime = new Date(startOfMinute.getTime() - 11 * 60000); // 11 minutes earlier
	const endTime = new Date(startOfMinute.getTime() + 11 * 60000); // 11 minutes later
	const {
		data: ingestorInfoData,
		isError: getIngestorInfoError,
		isSuccess: getIngestorInfoSuccess,
		isLoading: getIngestorInfoLoading,
		refetch: getIngestorInfoRefetch,
	} = useQuery<AxiosResponse<IngestorQueryRecord[]>, Error>(
		['fetch-ingestor-info', currentMachine, startTime.toLocaleString(), endTime.toLocaleString()],
		() => getIngestorInfo(currentMachine, startTime, endTime),
		{
			retry: false,
			refetchOnWindowFocus: false,
			enabled: currentMachine !== null && currentMachineType === 'ingestor',
			onSuccess: (data) => {
				setClusterStore((store) => setCurrentMachineData(store, data.data));
			},
		},
	);
	return {
		ingestorInfoData,
		getIngestorInfoError,
		getIngestorInfoSuccess,
		getIngestorInfoLoading,
		getIngestorInfoRefetch,
	};
};
