export type LogsQuery = {
	streamName: string;
	startTime: Date;
	endTime: Date;
	access: string[] | null;
};

export type GraphQuery = {
	stream: string;
	startTime: string;
	endTime: string;
	numBins: number;
};

export enum SortOrder {
	ASCENDING = 1,
	DESCENDING = -1,
}

export type LogsSearch = {
	search: string;
	filters: Record<string, string[]>;
	sort: {
		key: string;
		order: SortOrder;
	};
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

export type LogsResponseWithHeaders = {
	fields: string[];
	records: Log[];
} | null;

export type LogSelectedTimeRange = {
	state: 'fixed' | 'custom';
	value: string;
};

export type UserRoles = {
	roleName: {
		privilege: string;
		resource?: {
			stream: string;
			tag: string;
		};
	}[];
};
