import { Axios } from './axios';
import { LOG_STREAMS_QUERY_URL, QUERY_URL } from './constants';
import { LogsQuery } from '@/@types/parseable/api/query';
import dayjs from 'dayjs';

export const getQueryLogs = (logsQuery: LogsQuery) => {
	const startOfDay = dayjs().startOf('day');
	const {
		streamName,
		startTime = startOfDay.toDate(),
		endTime = startOfDay.endOf('day').toDate(),
		limit = 30,
		page = 1,
	} = logsQuery;

	const offset = limit * page - limit;

	const query = `SELECT * FROM ${streamName} ORDER BY p_timestamp DESC LIMIT ${limit} OFFSET ${offset}`;
	return Axios().post(
		QUERY_URL,
		{
			query,
			startTime,
			endTime,
		},
		{},
	);
};

export const getQueryLogsTotalCount = (logsQuery: LogsQuery) => {
	const startOfDay = dayjs().startOf('day');
	const { streamName, startTime = startOfDay.toDate(), endTime = startOfDay.endOf('day').toDate() } = logsQuery;

	const query = `SELECT COUNT(*) as 'totalCount' FROM ${streamName}`;

	return Axios().post(LOG_STREAMS_QUERY_URL, {
		query,
		startTime,
		endTime,
	});
};
