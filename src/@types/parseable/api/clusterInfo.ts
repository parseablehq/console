export type Ingestor = {
	domain_name: string;
	reachable: boolean;
	error: string | null;
	status: string;
	staging_path: string;
	storage_path: string;
};

export type IngestorMetrics = {
	address: string;
	parseable_events_ingested: number;
	parseable_staging_files: number;
	process_resident_memory_bytes: number;
	parseable_storage_size: {
		staging: number;
		data: number;
	};
};

export type ClusterInfo = Ingestor[];
