import { Axios } from './axios';
import { LOG_QUERY_URL } from './constants';
import { LogsQuery } from '@/@types/parseable/api/query';

export const getQueryLogs = (logsQuery: LogsQuery) => {
	const { startTime, endTime, streamName, limit, page } = logsQuery;

	const offset = limit * page - limit;

	const query = `SELECT * FROM ${streamName} ORDER BY p_timestamp DESC LIMIT ${limit} OFFSET ${offset}`;

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

export const getQueryLogsTotalCount = (logsQuery: LogsQuery) => {
	const { streamName, startTime, endTime } = logsQuery;

	const query = `SELECT COUNT(*) as 'totalCount' FROM ${streamName}`;

	return Axios().post(LOG_QUERY_URL, {
		query,
		startTime,
		endTime,
	});
};
