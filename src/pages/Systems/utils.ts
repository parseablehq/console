import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';

interface Label {
	[key: string]: string;
}

interface Metric {
	[key: string]: any;
}

export interface PrometheusMetricResponse {
	[key: string]: Metric[] | number | Label;
}

export function parsePrometheusResponse(response: string): null | PrometheusMetricResponse {
	const metrics: PrometheusMetricResponse = {};

	if (typeof response === 'string') {
		response
			.trim()
			.split('\n')
			.forEach((line) => {
				/* eslint-disable no-useless-escape */
				const matchWithLabels = line.match(/(\w+)\{([^\}]+)\}\s+(\d+)/);
				const matchWithoutLabels = line.match(/(\w+)\s+(\d+)/);

				if (matchWithLabels) {
					const metricName = matchWithLabels[1];
					const labelsStr = matchWithLabels[2];
					const labels: Label = labelsStr.split(',').reduce((acc: Label, label: string) => {
						const [key, value] = label.split('=');
						acc[key] = value.replace(/"/g, '');
						return acc;
					}, {});
					const value = parseInt(matchWithLabels[3], 10);

					if (!metrics[metricName]) {
						metrics[metricName] = [];
					}

					if (Array.isArray(metrics[metricName])) {
						(metrics[metricName] as Metric[]).push({ ...labels, value });
					} else {
						metrics[metricName] = [{ ...labels, value }];
					}
				} else if (matchWithoutLabels) {
					const metricName = matchWithoutLabels[1];
					const value = parseInt(matchWithoutLabels[2], 10);

					if (!metrics[metricName]) {
						metrics[metricName] = value;
					} else if (typeof metrics[metricName] === 'number') {
						metrics[metricName] = [{ value: metrics[metricName] }, { value }];
					} else {
						(metrics[metricName] as Metric[]).push({ value });
					}
				}
			});
	}

	if (Object.keys(metrics).length === 0) {
		return null;
	} else {
		return metrics;
	}
}

export const parseStreamDataMetrics = (metrics: Metric[] | number | Label | undefined) => {
	if (!metrics || !Array.isArray(metrics)) {
		return 0;
	}

	return metrics.reduce((acc, streamDatum) => {
		return streamDatum?.value ? acc + streamDatum.value : acc;
	}, 0);
};

export type SanitizedMetrics = {
	totalEventsIngested: string;
	totalBytesIngested: string;
	memoryUsage: string;
	stagingFilesCount: string;
	stagingSize: string;
};

export const sanitizeIngestorData = (prometheusResponse: PrometheusMetricResponse): SanitizedMetrics | null => {
	const { parseable_events_ingested, parseable_staging_files, parseable_storage_size, process_resident_memory_bytes } =
		prometheusResponse;
	const streamWiseDataStorage = Array.isArray(parseable_storage_size)
		? parseable_storage_size.filter((d) => d.type === 'data')
		: [];
	const streamWiseStagingStorage = Array.isArray(parseable_storage_size)
		? parseable_storage_size.filter((d) => d.type === 'staging')
		: [];
	const totalEventsIngested = parseStreamDataMetrics(parseable_events_ingested);
	const totalBytesIngested = parseStreamDataMetrics(streamWiseDataStorage);
	const stagingFilesCount = parseStreamDataMetrics(parseable_staging_files);
	const stagingSize = parseStreamDataMetrics(streamWiseStagingStorage);
	const memoryUsage = typeof process_resident_memory_bytes === 'number' ? process_resident_memory_bytes : 0;
	return {
		totalEventsIngested: HumanizeNumber(totalEventsIngested),
		totalBytesIngested: formatBytes(totalBytesIngested),
		memoryUsage: formatBytes(memoryUsage),
		stagingFilesCount: HumanizeNumber(stagingFilesCount),
		stagingSize: formatBytes(stagingSize),
	};
};
