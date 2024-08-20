import { Ingestor, IngestorMetrics, IngestorQueryRecord } from '@/@types/parseable/api/clusterInfo';
import { Axios } from './axios';
import { CLUSTER_INFO_URL, CLUSTER_METRICS_URL, INGESTOR_DELETE_URL, LOG_QUERY_URL } from './constants';

export const getClusterInfo = () => {
	return Axios().get<Ingestor[]>(CLUSTER_INFO_URL);
};

export const getIngestorInfo = (domain_name: string | null, startTime: Date, endTime: Date) => {
	const query = `SELECT * FROM pmeta where address = '${domain_name}' ORDER BY event_time DESC LIMIT 10 OFFSET 0`;

	return Axios().post<IngestorQueryRecord[]>(
		LOG_QUERY_URL(),
		{
			query,
			startTime,
			endTime,
		},
		{},
	);
};

export const getClusterMetrics = () => {
	return Axios().get<IngestorMetrics[]>(CLUSTER_METRICS_URL);
};

export const deleteIngestor = (ingestorUrl: string) => {
	return Axios().delete(INGESTOR_DELETE_URL(ingestorUrl));
};
