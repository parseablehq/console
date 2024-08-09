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

const fieldParms = "?fields=true"

// to optimize performace, it has been decided to round off the time at the given level
// so making the end-time inclusive
const optimizeEndTime = (endTime: Date) => {
	return dayjs(endTime).add(1, 'minute').toDate();
};

export const getQueryLogs = (logsQuery: QueryLogs, withFields?:boolean) => {
	const { startTime, endTime, streamName, limit, pageOffset } = logsQuery;
	const endPoint = LOG_QUERY_URL
	const query = `SELECT * FROM ${streamName} LIMIT ${limit} OFFSET ${pageOffset}`;
	return Axios().post(
		(withFields? endPoint.concat(fieldParms):endPoint),
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
};

export const getQueryResult = (logsQuery: LogsQuery, query = '', withFields?:boolean) => {
	const { startTime, endTime } = logsQuery;
	const endPoint = LOG_QUERY_URL

	return Axios().post(
		(withFields? endPoint.concat(fieldParms):endPoint),
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
};
