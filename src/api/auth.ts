import { Axios } from './axios';
import {  LOGIN_URL } from './constants';


export const loginIn = (username: string, password: string) => {
	const credentials = btoa(`${username}:${password}`);

	return Axios().get(LOGIN_URL, {
		headers: {
			Authorization: `Basic ${credentials}`,
		},
	});
};
