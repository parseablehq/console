import { Axios } from './axios';
import {  LOG_STREAM_LIST_URL } from './constants';

export const loginIn = (username: string, password: string) => {
	const credentials = btoa(`${username}:${password}`);

	return Axios().get(LOG_STREAM_LIST_URL, {
		headers: {
			Authorization: `Basic ${credentials}`,
		},
	});
};
