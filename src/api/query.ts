import { Axios } from './axios';
import { GRAPH_DATA_URL, LOG_QUERY_URL } from './constants';
import { GraphQuery, Log, LogsQuery, LogsResponseWithHeaders } from '@/@types/parseable/api/query';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { CorrelationQueryBuilder, QueryBuilder } from '@/utils/queryBuilder';

const { formatDateAsCastType } = timeRangeUtils;
type QueryLogs = {
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
	pageOffset: number;
};

type CorrelationLogs = {
	streamNames: string[];
	startTime: Date;
	endTime: Date;
	limit: number;
	correlationCondition?: string;
	selectedFields?: string[];
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
	const queryBuilder = new QueryBuilder(logsQuery);
	const query = queryBuilder.getQuery();
	const startTime = queryBuilder.getStartTime();
	const endTime = queryBuilder.getEndTime();

	return { query, startTime, endTime };
};

export const getQueryLogs = (logsQuery: QueryLogs) => {
	return Axios().post<Log[]>(LOG_QUERY_URL(), formQueryOpts(logsQuery), {});
};

export const getQueryLogsWithHeaders = (logsQuery: QueryLogs) => {
	const queryBuilder = new QueryBuilder(logsQuery);
	const endPoint = LOG_QUERY_URL({ fields: true }, queryBuilder.getResourcePath());
	return Axios().post<LogsResponseWithHeaders>(endPoint, formQueryOpts(logsQuery), {});
};

export const getCorrelationQueryLogsWithHeaders = (logsQuery: CorrelationLogs) => {
	const queryBuilder = new CorrelationQueryBuilder(logsQuery);
	const endPoint = LOG_QUERY_URL({ fields: true }, queryBuilder.getResourcePath());
	return Axios().post<LogsResponseWithHeaders>(endPoint, queryBuilder.getCorrelationQuery(), {});
};

export const getStreamDataWithHeaders = (logsQuery: CorrelationLogs) => {
	const queryBuilder = new CorrelationQueryBuilder(logsQuery);
	const endPoint = LOG_QUERY_URL({ fields: true }, queryBuilder.getResourcePath());
	return Axios().post<LogsResponseWithHeaders>(endPoint, queryBuilder.getQuery(), {});
};

// ------ Custom sql query

const makeCustomQueryRequestData = (logsQuery: LogsQuery, query: string) => {
	const { startTime, endTime } = logsQuery;
	return { query, startTime: optimizeTime(startTime), endTime: optimizeTime(endTime) };
};

export const getQueryResult = (logsQuery: LogsQuery, query = '') => {
	const endPoint = LOG_QUERY_URL();
	return Axios().post<Log[]>(endPoint, makeCustomQueryRequestData(logsQuery, query), {});
};

export const getQueryResultWithHeaders = (logsQuery: LogsQuery, query = '') => {
	const queryBuilder = new QueryBuilder(logsQuery);
	const endPoint = LOG_QUERY_URL({ fields: true }, queryBuilder.getResourcePath());
	return Axios().post<LogsResponseWithHeaders>(endPoint, makeCustomQueryRequestData(logsQuery, query), {});
};

export const getGraphData = (data: GraphQuery) => {
	return Axios().post<LogsResponseWithHeaders>(GRAPH_DATA_URL, data);
};
