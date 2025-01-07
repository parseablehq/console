import timeRangeUtils from '@/utils/timeRangeUtils';
import { QueryEngineType } from '@/@types/parseable/api/about';

const { formatDateAsCastType } = timeRangeUtils;

type QueryEngine = QueryEngineType;

type QueryLogs = {
	queryEngine?: QueryEngine;
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
	queryEngine?: QueryEngine;
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
	queryEngine?: QueryEngine;
	startTime: Date;
	endTime: Date;
	streamName: string;
	limit?: number;
	pageOffset?: number;
	timePartitionColumn?: string;

	constructor({
		queryEngine,
		startTime,
		endTime,
		streamName,
		limit,
		pageOffset,
		timePartitionColumn = 'p_timestamp',
	}: QueryLogs) {
		this.queryEngine = queryEngine;
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
		switch (this.queryEngine) {
			default:
				return this.parseableQuery();
		}
	}

	getResourcePath(): string {
		switch (this.queryEngine) {
			default:
				return PARSEABLE_RESOURCE_PATH;
		}
	}
}

export class FilterQueryBuilder {
	queryEngine?: QueryEngine;
	whereClause: string;
	streamName: string;
	limit: number;
	timeRangeCondition?: string;

	constructor({ streamName, limit, whereClause, queryEngine, timeRangeCondition = '(1=1)' }: FilterQueryBuilderType) {
		this.queryEngine = queryEngine;
		this.whereClause = whereClause;
		this.streamName = streamName;
		this.limit = limit;
		this.timeRangeCondition = timeRangeCondition;
	}

	getParseableQuery(): string {
		return `select * from \"${this.streamName}\" where ${this.whereClause} LIMIT ${this.limit}`;
	}

	getQuery(): string {
		switch (this.queryEngine) {
			default:
				return this.getParseableQuery();
		}
	}
}
