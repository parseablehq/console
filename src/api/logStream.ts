import { CreateSavedFilterType, SavedFilterType } from '@/@types/parseable/api/savedFilters';
import { Axios } from './axios';
import {
	DELETE_STREAMS_URL,
	LOG_STREAMS_SCHEMA_URL,
	LOG_STREAM_LIST_URL,
	LOG_STREAMS_ALERTS_URL,
	LOG_STREAMS_RETRNTION_URL,
	LOG_STREAMS_STATS_URL,
	CREATE_STREAM_URL,
	LOG_STREAMS_INFO_URL,
	LIST_SAVED_FILTERS_URL,
	UPDATE_SAVED_FILTERS_URL,
	DELETE_SAVED_FILTERS_URL,
	CREATE_SAVED_FILTERS_URL,
	LOG_STREAM_HOT_TIER
} from './constants';
import { HotTierConfig, LogStreamData, LogStreamSchemaData } from '@/@types/parseable/api/stream';

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

export const getSavedFilters = (userId: string) => {
	return Axios().get<SavedFilterType[]>(LIST_SAVED_FILTERS_URL(userId));
};

export const putSavedFilters = (filterId: string, filter: SavedFilterType) => {
	return Axios().put(UPDATE_SAVED_FILTERS_URL(filterId), filter);
};

export const postSavedFilters = (filter: CreateSavedFilterType) => {
	return Axios().post(CREATE_SAVED_FILTERS_URL, filter);
};

export const deleteSavedFilter = (filterId: string) => {
	return Axios().delete(DELETE_SAVED_FILTERS_URL(filterId));
};

export const getLogStreamRetention = (streamName: string) => {
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

export const createLogStream = (streamName: string, data: any, headers: any) => {
	return Axios().put(CREATE_STREAM_URL(streamName), data, { headers });
};

export const updateLogStream = (streamName: string, data: any, headers: any) => {
	return Axios().put(CREATE_STREAM_URL(streamName), data, { headers });
};

export const getLogStreamInfo = (streamName: string) => {
	return Axios().get(LOG_STREAMS_INFO_URL(streamName));
};

export const getHotTierInfo = (streamName: string) => {
	return Axios().get<HotTierConfig>(LOG_STREAM_HOT_TIER(streamName));
};

export const updateHotTierInfo = (streamName: string, data: any) => {
	return Axios().put(LOG_STREAM_HOT_TIER(streamName), data);
};

export const deleteHotTierInfo = (streamName: string) => {
	return Axios().delete(LOG_STREAM_HOT_TIER(streamName));
};
