export type Ingestor = {
	domain_name: string;
	reachable: boolean;
	error: string | null;
	status: string;
	stagingPath: string;
	storePath: string;
}

export type ClusterInfo = Ingestor[]