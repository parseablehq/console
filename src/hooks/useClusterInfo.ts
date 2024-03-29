import { useMutation, useQuery } from 'react-query';
import { AxiosError, AxiosResponse, isAxiosError } from 'axios';
import { getClusterInfo, getClusterMetrics, deleteIngestor } from '@/api/cluster';
import { Ingestor, IngestorMetrics } from '@/@types/parseable/api/clusterInfo';
import { notifyError, notifySuccess } from '@/utils/notification';

export const useClusterInfo = () => {
	const {
		data: clusterInfoData,
		isError: getClusterInfoError,
		isSuccess: getClusterInfoSuccess,
		isLoading: getClusterInfoLoading,
		refetch: getClusterInfoRefetch,
	} = useQuery<AxiosResponse<Ingestor[]>, Error>(['fetch-cluster-info'], () => getClusterInfo(), {
		retry: false,
		refetchOnWindowFocus: false,
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
			notifySuccess({ message: 'Ingestor removed successfullys' });
		},
	});

	return {
		deleteIngestorMutation,
		deleteIngestorIsSuccess,
		deleteIngestorIsError,
		deleteIngestorIsLoading,
	};
};
