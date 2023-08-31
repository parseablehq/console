import axios from 'axios';

const baseURL = import.meta.env.VITE_PARSEABLE_URL ?? '/';

const instance = axios.create({ baseURL, validateStatus: () => true });

instance.interceptors.request.use(
	(request) => {
		// const credentials = localStorage.getItem('credentials');

		// if (credentials) {
		// 	const Authorization = credentials ? `Basic ${credentials}` : null;
		// 	request.headers.Authorization = Authorization;
		// }

		return request;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export const Axios = () => instance;
