import dayjs from 'dayjs';
import { Axios } from './axios';
import { LOG_QUERY_URL } from './constants';
import { LogsQuery } from '@/@types/parseable/api/query';

type QueryLogs = {
	streamName: string;
	startTime: Date;
	endTime: Date;
	limit: number;
	pageOffset: number;
};

type QueryParams = {
	params: string;
}


// to optimize performace, it has been decided to round off the time at the given level
// so making the end-time inclusive
const optimizeEndTime = (endTime: Date) => {
	return dayjs(endTime).add(1, 'minute').toDate();
};

export const getQueryLogs = (logsQuery: QueryLogs, QueryParams?:QueryParams) => {
	const { startTime, endTime, streamName, limit, pageOffset } = logsQuery;
	const params = QueryParams && QueryParams.params
	const endPoint = LOG_QUERY_URL.concat("?" +(params||''))
	const query = `SELECT * FROM ${streamName} LIMIT ${limit} OFFSET ${pageOffset}`;
	return Axios().post(
		endPoint,
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
};

export const getQueryResult = (logsQuery: LogsQuery, query = '', QueryParams?:QueryParams) => {
	const { startTime, endTime } = logsQuery;
	const params = QueryParams && QueryParams.params
	const endPoint = LOG_QUERY_URL.concat("?" +(params||''))

	return Axios().post(
		endPoint,
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
};
