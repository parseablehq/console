import { Axios } from './axios';
import { LOG_STREAMS_SCHEMA_URL, LOG_STREAM_LIST_URL, STATS_STREAMS_ALERTS_URL, STATS_STREAMS_RETRNTION_URL, STATS_STREAMS_STATS_URL } from './constants';
import { LogStreamData, LogStreamSchemaData } from '@/@types/parseable/api/stream';

export const getLogStreamList = () => {
	return Axios().get<LogStreamData>(LOG_STREAM_LIST_URL);
};

export const getLogStreamSchema = (streamName: string) => {
	return Axios().get<LogStreamSchemaData>(LOG_STREAMS_SCHEMA_URL(streamName));
};

export const getLogStreamAlerts = (streamName: string) => {
	return Axios().get(STATS_STREAMS_ALERTS_URL(streamName));
}

export const getLogStreamRetention = (streamName: string) => {
	return Axios().get(STATS_STREAMS_RETRNTION_URL(streamName));
}

export const getLogStreamStats = (streamName: string) => {
	return Axios().get(STATS_STREAMS_STATS_URL(streamName));
}