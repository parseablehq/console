import { Axios } from './axios';
import {
	DELETE_STREAMS_URL,
	LOG_STREAMS_SCHEMA_URL,
	LOG_STREAM_LIST_URL,
	LOG_STREAMS_ALERTS_URL,
	LOG_STREAMS_RETRNTION_URL,
	LOG_STREAMS_STATS_URL,
} from './constants';
import { LogStreamData, LogStreamSchemaData } from '@/@types/parseable/api/stream';

export const getLogStreamList = () => {
	return Axios().get<LogStreamData>(LOG_STREAM_LIST_URL);
};

export const getLogStreamSchema = (streamName: string) => {
	return Axios().get<LogStreamSchemaData>(LOG_STREAMS_SCHEMA_URL(streamName));
};

export const getLogStreamAlerts = (streamName: string) => {
	return Axios().get(LOG_STREAMS_ALERTS_URL(streamName));
};

export const putLogStreamAlerts = (streamName: string, data: any) => {
	return Axios().put(LOG_STREAMS_ALERTS_URL(streamName), data);
};

export const getLogStreamRetention = (streamName: string) => {
	console.log('getLogStreamRetention', streamName, LOG_STREAMS_RETRNTION_URL(streamName));
	return Axios().get(LOG_STREAMS_RETRNTION_URL(streamName));
};

export const putLogStreamRetention = (streamName: string, data: any) => {
	return Axios().put(LOG_STREAMS_RETRNTION_URL(streamName), data);
};

export const getLogStreamStats = (streamName: string) => {
	return Axios().get(LOG_STREAMS_STATS_URL(streamName));
};

export const deleteLogStream = (streamName: string) => {
	return Axios().delete(DELETE_STREAMS_URL(streamName));
};
