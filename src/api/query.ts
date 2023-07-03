import { Axios } from './axios';
import { LOG_QUERY_URL } from './constants';
import { LogsQuery } from '@/@types/parseable/api/query';

export const getQueryLogs = (logsQuery: LogsQuery) => {
	const { startTime, endTime, streamName } = logsQuery;

	const query = `SELECT * FROM ${streamName} ORDER BY p_timestamp DESC`;

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
