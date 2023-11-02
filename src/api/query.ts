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

export const getQueryLogs = (logsQuery: QueryLogs) => {
	const { startTime, endTime, streamName, limit, pageOffset } = logsQuery;

	const query = `SELECT * FROM ${streamName} LIMIT ${limit} OFFSET ${pageOffset}`;

	return Axios().post(
		LOG_QUERY_URL,
		{
			query,
			startTime,
			endTime,
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
			endTime,
		},
		{},
	);
};

export const getQueryCount = (logsQuery: LogsQuery) => {
	const { startTime, endTime, streamName } = logsQuery;

	const query = `SELECT count(*) as totalcurrentcount FROM ${streamName}`;

	return Axios().post(
		LOG_QUERY_URL,
		{
			query,
			startTime,
			endTime,
		},
		{},
	);
};
