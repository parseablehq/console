import timeRangeUtils from '@/utils/timeRangeUtils';

const { formatDateAsCastType } = timeRangeUtils;

type QueryLogs = {
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit?: number;
	pageOffset?: number;
	timePartitionColumn?: string;
};

type FilterQueryBuilderType = {
	streamName: string;
	limit: number;
	whereClause: string;
	timeRangeCondition?: string;
};

//! RESOURCE PATH CONSTANTS
const PARSEABLE_RESOURCE_PATH = 'query';

const optimizeTime = (date: Date) => {
	const tempDate = new Date(date);
	tempDate.setSeconds(0);
	tempDate.setMilliseconds(0);
	return tempDate;
};

export class QueryBuilder {
	startTime: Date;
	endTime: Date;
	streamName: string;
	limit?: number;
	pageOffset?: number;
	timePartitionColumn?: string;

	constructor({ startTime, endTime, streamName, limit, pageOffset, timePartitionColumn = 'p_timestamp' }: QueryLogs) {
		this.startTime = startTime;
		this.endTime = endTime;
		this.streamName = streamName;
		this.limit = limit;
		this.pageOffset = pageOffset;
		this.timePartitionColumn = timePartitionColumn;
	}
	getStartTime(): string {
		return formatDateAsCastType(optimizeTime(this.startTime));
	}

	getEndTime(): string {
		return formatDateAsCastType(optimizeTime(this.endTime));
	}

	parseableQuery(): string {
		const offsetPart = typeof this.pageOffset === 'number' ? `OFFSET ${this.pageOffset}` : '';
		return `SELECT * FROM \"${this.streamName}\" ${offsetPart} LIMIT ${this.limit}`;
	}

	getQuery(): string {
		return this.parseableQuery();
	}

	getResourcePath(): string {
		return PARSEABLE_RESOURCE_PATH;
	}
}

export class FilterQueryBuilder {
	whereClause: string;
	streamName: string;
	limit: number;
	timeRangeCondition?: string;

	constructor({ streamName, limit, whereClause, timeRangeCondition = '(1=1)' }: FilterQueryBuilderType) {
		this.whereClause = whereClause;
		this.streamName = streamName;
		this.limit = limit;
		this.timeRangeCondition = timeRangeCondition;
	}

	getParseableQuery(): string {
		return `select * from \"${this.streamName}\" where ${this.whereClause} LIMIT ${this.limit}`;
	}

	getQuery(): string {
		return this.getParseableQuery();
	}
}
