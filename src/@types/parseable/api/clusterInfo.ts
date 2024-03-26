export type Ingestor = {
	domain_name: string;
	reachable: boolean;
	error: string | null;
	status: string;
	staging_path: string;
	storage_path: string;
};

export type ClusterInfo = Ingestor[];
