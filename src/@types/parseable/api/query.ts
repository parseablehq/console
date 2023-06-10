export type LogsQuery = {
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
	page: number;
};
