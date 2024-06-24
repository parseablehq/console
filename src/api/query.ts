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

// to optimize performace, it has been decided to round off the time at the given level
// so making the end-time inclusive
const optimizeEndTime = (endTime: Date) => {
	return dayjs(endTime).add(1, 'minute').toDate();
};

export const getQueryLogs = (logsQuery: QueryLogs) => {
	const { startTime, endTime, streamName, limit, pageOffset } = logsQuery;

	const query = `SELECT * FROM ${streamName} LIMIT ${limit} OFFSET ${pageOffset}`;

	return Axios().post(
		LOG_QUERY_URL,
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
};

export const getQueryResult = (logsQuery: LogsQuery, query = '') => {
	const { startTime, endTime } = logsQuery;

	return Axios().post(
		LOG_QUERY_URL,
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
};
