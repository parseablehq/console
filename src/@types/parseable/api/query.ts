export type LogsQuery = {
	streamName: string;
	startTime: Date;
	endTime: Date;
};

export type LogsSearch = {
	search: string;
	filters: Record<string, string[]>;
};

export type LogsData = {
	totalPages: number;
	totalCount: number;
	data: Log[];
	page: number;
	limit: number;
};

export type Log = {
	p_timestamp: string;
	p_metadata: string;
	p_tags: string;
	[key: string]: string | number | null | Date;
};
