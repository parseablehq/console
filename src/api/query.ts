import { Axios } from './axios';
import { LOG_QUERY_URL } from './constants';
import { LogsQuery, QueryAPI } from '@/@types/parseable/api/query';



export const getQueryLogs = (logsQuery: QueryAPI) => {
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

export const getQueryResult = (logsQuery: QueryAPI, query = '') => {
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
