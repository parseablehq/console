import { Axios } from './axios';
import { LOG_QUERY_URL } from './constants';
import { Log, LogsQuery, LogsResponseWithHeaders } from '@/@types/parseable/api/query';

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

const makeDefaultQueryRequestData = (logsQuery: QueryLogs) => {
	const { startTime, endTime, streamName, limit, pageOffset } = logsQuery;
	const query = `SELECT * FROM ${streamName} LIMIT ${limit} OFFSET ${pageOffset}`;
	return { query, startTime: optimizeTime(startTime), endTime: optimizeTime(endTime) };
};

export const getQueryLogs = (logsQuery: QueryLogs) => {
	return Axios().post<Log[]>(LOG_QUERY_URL(), makeDefaultQueryRequestData(logsQuery), {});
};

export const getQueryLogsWithHeaders = (logsQuery: QueryLogs) => {
	return Axios().post<LogsResponseWithHeaders>(
		LOG_QUERY_URL({ fields: true }),
		makeDefaultQueryRequestData(logsQuery),
		{},
	);
};

// ------ Custom sql query

const makeCustomQueryRequestData = (logsQuery: LogsQuery, query: string) => {
	const { startTime, endTime } = logsQuery;
	return { query, startTime: optimizeTime(startTime), endTime: optimizeTime(endTime) };
};

export const getQueryResult = (logsQuery: LogsQuery, query = '') => {
	return Axios().post<Log[]>(LOG_QUERY_URL(), makeCustomQueryRequestData(logsQuery, query), {});
};

export const getQueryResultWithHeaders = (logsQuery: LogsQuery, query = '') => {
	return Axios().post<LogsResponseWithHeaders>(
		LOG_QUERY_URL({ fields: true }),
		makeCustomQueryRequestData(logsQuery, query),
		{},
	);
};
