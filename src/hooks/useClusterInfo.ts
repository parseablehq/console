import { useQuery } from 'react-query';
import {  AxiosResponse } from 'axios';
import { getClusterInfo, getClusterMetrics } from '@/api/cluster';
import { Ingestor } from '@/@types/parseable/api/clusterInfo';

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
		data: clusterMetricsData,
		isError: getClusterMetricsError,
		isSuccess: getClusterMetricsSuccess,
		isLoading: getClusterMetricsLoading,
		refetch: getClusterMetricsRefetch,
	} = useQuery(['fetch-cluster-metrics'], () => getClusterMetrics(), {
		retry: false,
		refetchOnWindowFocus: false,
	});
	return {
		clusterMetricsData,
		getClusterMetricsError,
		getClusterMetricsSuccess,
		getClusterMetricsLoading,
		getClusterMetricsRefetch,
	};
};
