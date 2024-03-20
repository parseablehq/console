import { Ingestor } from '@/@types/parseable/api/clusterInfo';
import { Axios } from './axios';
import { CLUSTER_INFO_URL, CLUSTER_METRICS_URL } from './constants';

export const getClusterInfo = () => {
	return Axios().get<Ingestor[]>(CLUSTER_INFO_URL);
};

export const getClusterMetrics = () => {
	return Axios().get(CLUSTER_METRICS_URL);
}