import timeRangeUtils from '@/utils/timeRangeUtils';

const { formatDateAsCastType } = timeRangeUtils;

type QueryEngine = 'Trino' | 'Parseable' | undefined;

type QueryLogs = {
	queryEngine: QueryEngine;
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
	pageOffset?: number;
	timePartitionColumn?: string;
};

export class QueryBuilder {
	queryEngine: QueryEngine;
	startTime: Date;
	endTime: Date;
	streamName: string;
	limit: number;
	pageOffset?: number;
	timePartitionColumn: string;

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

	optimizeTime(date: Date): Date {
		const tempDate = new Date(date);
		tempDate.setSeconds(0);
		tempDate.setMilliseconds(0);
		return tempDate;
	}

	getStartTime(): string {
		return formatDateAsCastType(this.optimizeTime(this.startTime));
	}

	getEndTime(): string {
		return formatDateAsCastType(this.optimizeTime(this.endTime));
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
