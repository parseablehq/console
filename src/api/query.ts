import _ from 'lodash';
import { Axios } from './axios';
import { LOG_QUERY_URL, LOG_TRINO_QUERY_URL } from './constants';
import { Log, LogsQuery, LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import timeRangeUtils from '@/utils/timeRangeUtils';

const { formatDateAsCastType } = timeRangeUtils;
type QueryLogs = {
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
	pageOffset: number;
};

// to optimize query performace, it has been decided to round off the time at the given level
const optimizeTime = (date: Date) => {
	const tempDate = new Date(date);
	tempDate.setSeconds(0);
	tempDate.setMilliseconds(0);
	return tempDate;
};

// ------ Default sql query

type FormQueryOptsType = Omit<QueryLogs, 'pageOffset'> & {
	pageOffset?: number;
	timePartitionColumn?: string;
};

export const timeRangeSQLCondition = (timePartitionColumn: string, startTime: Date, endTime: Date) => {
	return `${timePartitionColumn} >= CAST('${formatDateAsCastType(
		optimizeTime(startTime),
	)}' AS TIMESTAMP) and ${timePartitionColumn} < CAST('${formatDateAsCastType(optimizeTime(endTime))}' AS TIMESTAMP)`;
};

export const formQueryOpts = (logsQuery: FormQueryOptsType) => {
	const { startTime, endTime, streamName, limit, pageOffset, timePartitionColumn = 'p_timestamp' } = logsQuery;
	const optimizedStartTime = optimizeTime(startTime);
	const optimizedEndTime = optimizeTime(endTime);
	const orderBy = `ORDER BY ${timePartitionColumn} desc`;
	const timestampClause = timeRangeSQLCondition(timePartitionColumn, optimizedStartTime, optimizedEndTime);
	const offsetPart = _.isNumber(pageOffset) ? `OFFSET ${pageOffset}` : '';
	const query = `SELECT * FROM ${streamName} where ${timestampClause} ${orderBy} ${offsetPart} LIMIT ${limit} `;
	return { query, startTime: optimizedStartTime, endTime: optimizedEndTime };
};

export const getQueryLogs = (logsQuery: QueryLogs) => {
	return Axios().post<Log[]>(LOG_TRINO_QUERY_URL(), formQueryOpts(logsQuery), {});
};

export const getQueryLogsWithHeaders = (logsQuery: QueryLogs) => {
	return Axios().post<LogsResponseWithHeaders>(LOG_TRINO_QUERY_URL({ fields: true }), formQueryOpts(logsQuery), {});
};

// ------ Custom sql query

const makeCustomQueryRequestData = (logsQuery: LogsQuery, query: string) => {
	const { startTime, endTime } = logsQuery;
	return { query, startTime: optimizeTime(startTime), endTime: optimizeTime(endTime) };
};

export const getQueryResult = (logsQuery: LogsQuery, query = '', useTrino = true) => {
	const endPoint = useTrino ? LOG_TRINO_QUERY_URL() : LOG_QUERY_URL();
	return Axios().post<Log[]>(endPoint, makeCustomQueryRequestData(logsQuery, query), {});
};

export const getQueryResultWithHeaders = (logsQuery: LogsQuery, query = '', useTrino = true) => {
	const endPoint = useTrino ? LOG_TRINO_QUERY_URL({ fields: true }) : LOG_QUERY_URL({ fields: true });
	return Axios().post<LogsResponseWithHeaders>(endPoint, makeCustomQueryRequestData(logsQuery, query), {});
};
