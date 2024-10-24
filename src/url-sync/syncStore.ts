import dayjs from 'dayjs';
export const getAllParams = (): Record<string, string> => {
	const searchParams = window.location.search;
	const paramsString = searchParams.slice(1);
	const decodedParams = decodeURI(paramsString);
	const params = decodedParams.split('&');
	const parsedParams: { [key: string]: string } = {};
	params.forEach((el) => {
		const keyValueSlice = el.split('=');
		parsedParams[keyValueSlice[0]] = keyValueSlice[1];
	});

	return parsedParams;
};

export const syncStoretoURL = (searchParams: Record<string, string | Date | number>) => {
	const paramsSlice = Object.entries(searchParams);
	const stage = paramsSlice.map(([key, value]) => `${encodeURI(key)}=${encodeURI(value.toString())}`);
	const finalParams = stage.join('&');
	const finalURL = `?${finalParams}`;
	window.history.pushState({}, '', finalURL);
};

export const simplifyDate = (dateTime: Date) => {
	const dateInstance = dayjs(dateTime);
	const formattedDate = `${dateInstance.format('DD-MMM-YYYY_HH:mm')}`;

	return formattedDate;
};

export const parseDate = (dateTime: string) => {
	const fomatDateForParsing = dateTime.replace('_', ' ');
	return dayjs(fomatDateForParsing, 'DD-MMM-YYYY_HH:mm', true);
};
