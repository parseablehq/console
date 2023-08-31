import { Axios } from './axios';
import { LOG_QUERY_URL } from './constants';
import { LogsQuery } from '@/@types/parseable/api/query';

export const getQueryLogs = (logsQuery: LogsQuery) => {
	const { startTime, endTime, streamName } = logsQuery;

	const query = `SELECT count(*) OVER () as currentquerycount, c.* FROM ${streamName} c ORDER BY p_timestamp DESC limit 30000`;

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
