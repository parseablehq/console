import timeRangeUtils from '@/utils/timeRangeUtils';
import { QueryEngineType } from '@/@types/parseable/api/about';

const { formatDateAsCastType } = timeRangeUtils;

type QueryEngine = QueryEngineType;

type QueryLogs = {
	queryEngine: QueryEngine;
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
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
	limit: number;
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

	getTrinoQuery(): string {
		const optimizedStartTime = this.getStartTime();
		const optimizedEndTime = this.getEndTime();
		const timestampClause = `${this.timePartitionColumn} >= CAST('${optimizedStartTime}' AS TIMESTAMP) AND ${this.timePartitionColumn} < CAST('${optimizedEndTime}' AS TIMESTAMP)`;

		const orderBy = `ORDER BY ${this.timePartitionColumn} DESC`;
		const offsetPart = typeof this.pageOffset === 'number' ? `OFFSET ${this.pageOffset}` : '';

		return `SELECT * FROM \"${this.streamName}\" WHERE ${timestampClause} ${orderBy} ${offsetPart} LIMIT ${this.limit}`;
	}

	getParseableQuery(): string {
		const offsetPart = typeof this.pageOffset === 'number' ? `OFFSET ${this.pageOffset}` : '';
		return `SELECT * FROM \"${this.streamName}\" ${offsetPart} LIMIT ${this.limit}`;
	}

	getQuery(): string {
		switch (this.queryEngine) {
			case 'Trino':
				return this.getTrinoQuery();
			default:
				return this.getParseableQuery();
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

	getTrinoQuery(): string {
		return `select * from \"${this.streamName}\" where ${this.whereClause} AND ${this.timeRangeCondition} offset 0 limit ${this.limit}`;
	}

	getParseableQuery(): string {
		return `select * from \"${this.streamName}\" where ${this.whereClause} limit ${this.limit}`;
	}

	getQuery(): string {
		switch (this.queryEngine) {
			case 'Trino':
				return this.getTrinoQuery();
			default:
				return this.getParseableQuery();
		}
	}
}
