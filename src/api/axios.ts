import { signOutHandler } from '@/utils';
import axios from 'axios';

const baseURL = import.meta.env.VITE_PARSEABLE_URL ?? '/';

const instance = axios.create({ baseURL, withCredentials: true });

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
