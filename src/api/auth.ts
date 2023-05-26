import { Axios } from './axios';
import { HEALTH_LIVENESS_URL } from './constants';

export const loginIn = (username: string, password: string) => {
	const credentials = btoa(`${username}:${password}`);

	return Axios().get(HEALTH_LIVENESS_URL, {
		headers: {
			Authorization: `Basic ${credentials}`,
		},
	});
};
