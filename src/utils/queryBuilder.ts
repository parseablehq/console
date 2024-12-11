import timeRangeUtils from '@/utils/timeRangeUtils';
import { QueryEngineType } from '@/@types/parseable/api/about';

const { formatDateAsCastType } = timeRangeUtils;

type QueryEngine = QueryEngineType;

type QueryLogs = {
	queryEngine?: QueryEngine;
	streamName?: string;
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

type CorrelationQueryBuilderType = {
	streamNames: string[];
	limit: number;
	queryEngine?: QueryEngine;
	correlationCondition?: string;
	selectedFields?: string[];
	startTime: Date;
	endTime: Date;
};

//! RESOURCE PATH CONSTANTS
const PARSEABLE_RESOURCE_PATH = 'query';
const TRINO_RESOURCE_PATH = 'trinoquery';

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
	streamName?: string;
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

	trinoQuery(): string {
		const optimizedStartTime = this.getStartTime();
		const optimizedEndTime = this.getEndTime();
		const timestampClause = `${this.timePartitionColumn} >= CAST('${optimizedStartTime}' AS TIMESTAMP) AND ${this.timePartitionColumn} < CAST('${optimizedEndTime}' AS TIMESTAMP)`;

		const orderBy = `ORDER BY ${this.timePartitionColumn} DESC`;
		const offsetPart = typeof this.pageOffset === 'number' ? `OFFSET ${this.pageOffset}` : '';

		return `SELECT * FROM \"${this.streamName}\" WHERE ${timestampClause} ${orderBy} ${offsetPart} LIMIT ${this.limit}`;
	}

	parseableQuery(): string {
		const offsetPart = typeof this.pageOffset === 'number' ? `OFFSET ${this.pageOffset}` : '';
		return `SELECT * FROM \"${this.streamName}\" ${offsetPart} LIMIT ${this.limit}`;
	}

	getQuery(): string {
		switch (this.queryEngine) {
			case 'Trino':
				return this.trinoQuery();
			default:
				return this.parseableQuery();
		}
	}

	getResourcePath(): string {
		switch (this.queryEngine) {
			case 'Trino':
				return TRINO_RESOURCE_PATH;
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

	getTrinoQuery(): string {
		return `select * from \"${this.streamName}\" where ${this.whereClause} AND ${this.timeRangeCondition} offset 0 LIMIT ${this.limit}`;
	}

	getParseableQuery(): string {
		return `select * from \"${this.streamName}\" where ${this.whereClause} LIMIT ${this.limit}`;
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

export class CorrelationQueryBuilder {
	queryEngine?: QueryEngine;
	streamNames: string[];
	limit: number;
	correlationCondition?: string;
	selectedFields?: string[];
	startTime: Date;
	endTime: Date;

	constructor({
		streamNames,
		limit,
		queryEngine,
		correlationCondition,
		selectedFields,
		startTime,
		endTime,
	}: CorrelationQueryBuilderType) {
		this.queryEngine = queryEngine;
		this.streamNames = streamNames;
		this.startTime = startTime;
		this.endTime = endTime;
		this.limit = limit;
		this.correlationCondition = correlationCondition;
		this.selectedFields = selectedFields;
	}

	getParseableQuery() {
		const query =
			this.correlationCondition && this.selectedFields
				? `select ${this.selectedFields.map((field) => `${field} as "${field}"`).join(', ')} from \"${
						this.streamNames[0]
				  }\" join \"${this.streamNames[1]}\" on ${this.correlationCondition} offset 0 LIMIT ${this.limit}`
				: `SELECT * FROM \"${this.streamNames[0]}\" LIMIT ${this.limit}`;
		return {
			startTime: this.startTime,
			endTime: this.endTime,
			query,
		};
	}
	getResourcePath(): string {
		switch (this.queryEngine) {
			case 'Trino':
				return TRINO_RESOURCE_PATH;
			default:
				return PARSEABLE_RESOURCE_PATH;
		}
	}

	getQuery() {
		switch (this.queryEngine) {
			default:
				return this.getParseableQuery();
		}
	}
}
