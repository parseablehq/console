import { signOutHandler } from '@/utils';
import axios from 'axios';
import _ from 'lodash';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.VITE_PARSEABLE_URL ?? '/';
const useBasicAuth = import.meta.env.VITE_USE_BASIC_AUTH;

const createAxiosInstance = () => {
	const defaultOpts = { baseURL, withCredentials: true };
	const opts = (() => {
		if (_.isString(useBasicAuth) && useBasicAuth === 'true') {
			const username = import.meta.env.VITE_USERNAME;
			const password = import.meta.env.VITE_PASSWORD;
			if (!_.isString(username) || !_.isString(password)) return defaultOpts;

			// server will always send cookies
			// creating mock cookies to avoid updating existing code since this implementation is focused on development only
			Cookies.set('username', username);
			Cookies.set('session', 'mock-key');
			const credentials = btoa(`${username}:${password}`);
			const authHeader = `Basic ${credentials}`;
			return { baseURL, withCredentials: false, headers: { Authorization: authHeader } };
		} else {
			return defaultOpts;
		}
	})();
	return axios.create(opts);
};

const instance = createAxiosInstance();

instance.interceptors.request.use(
	(request) => {
		return request;
	},
	(error) => {
		return Promise.reject(error);
	},
);

instance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const status = error.status || (error.response ? error.response.status : 0);
		if (status === 401) {
			signOutHandler();
		}
		return Promise.reject(error);
	},
);

export const Axios = () => instance;
