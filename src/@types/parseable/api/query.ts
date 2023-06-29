export type LogsQuery = {
	searchText: string;
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
	page: number;
};
