import dayjs from 'dayjs';
import axios from 'axios';

export const wait = (sec = 1) => new Promise<void>((res) => setTimeout(res, sec * 1000));

export const randNum = (min = 1, max = 5) => Math.floor(Math.random() * (max - min + 1)) + min;

type ScrollToOptions = {
	y?: number;
	x?: number;
	behavior?: 'auto' | 'smooth';
};

export const scrollTo = (opts?: ScrollToOptions) => {
	const { y = 0, x = 0, behavior = 'auto' } = opts || {};
	window.scrollTo({ top: y, left: x, behavior });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseLogData = (value?: any, columnName?: string) => {
	const dateColumnNames = ['date', 'datetime', 'time', 'timestamp', 'p_timestamp'];

	if (columnName && dateColumnNames.includes(columnName) && dayjs(value).isValid()) {
		if (columnName === 'p_timestamp') {
			const parsedDate = new Date(dayjs(value).format('YYYY-MM-DD HH:mm +00:00'));
			return dayjs(parsedDate).utc(true).format('DD/MM/YYYY HH:mm:ss');
		}
		return dayjs(value).utc(true).format('DD/MM/YYYY HH:mm:ss');
	}

	if (value) {
		return value;
	}

	return 'N/A';
};

export const makeAPIRequest = async (promptContent: string) => {
	const data = {
		model: 'gpt-3.5-turbo',
		messages: [{ role: 'user', content: promptContent }],
		temperature: 0.5,
	};

	const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	};

	try {
		const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
		const {
			choices: [choice],
		} = response.data;
		return choice.message.content;
	} catch (error) {
		console.error(error);
	}
};
