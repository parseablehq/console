import { useQuery } from 'react-query';
import {  AxiosResponse } from 'axios';
import { getClusterInfo, getClusterMetrics } from '@/api/cluster';
import { Ingestor, IngestorMetrics } from '@/@types/parseable/api/clusterInfo';

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
