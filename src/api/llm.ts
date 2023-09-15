import { Axios } from './axios';
import { LLM_QUERY_URL } from './constants';

export const postLLM = (prompt: string, stream: string) => {
	return Axios().post(LLM_QUERY_URL, {
		prompt,
		stream,
	});
};
