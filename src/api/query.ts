import { Axios } from './axios';
import { LOG_QUERY_URL } from './constants';
import { LogsQuery } from '@/@types/parseable/api/query';
import timeRangeUtils from '@/utils/timeRangeUtils';

const { optimizeEndTime } = timeRangeUtils;

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
		LOG_QUERY_URL(),
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
		LOG_QUERY_URL(),
		{
			query,
			startTime,
			endTime: optimizeEndTime(endTime),
		},
		{},
	);
};
