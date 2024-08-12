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

export type IngestorQueryRecord = {
	address: string;
	parseable_events_ingested: number;
	parseable_events_ingested_size: number;
	parseable_lifetime_events_ingested: number;
	parseable_lifetime_events_ingested_size: number;
	parseable_deleted_events_ingested: number;
	parseable_deleted_events_ingested_size: number;
	parseable_staging_files: number;
	process_resident_memory_bytes: number;
	event_type: string;
	event_time: string;
	commit: string;
	staging: string;
	cache: string;
	parseable_storage_size_data: number;
	parseable_storage_size_staging: number;
	parseable_lifetime_storage_size_data: number;
	parseable_lifetime_storage_size_staging: number;
	parseable_deleted_storage_size_data: number;
	parseable_deleted_storage_size_staging: number;
};
