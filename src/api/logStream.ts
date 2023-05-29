import { Axios } from './axios';
import { LOG_STREAM_LIST_URL } from './constants';
import { LogStreamData } from '@/@types/parseable/api/stream';

export const getLogStreamList = () => {
	return Axios().get<LogStreamData>(LOG_STREAM_LIST_URL);
};
