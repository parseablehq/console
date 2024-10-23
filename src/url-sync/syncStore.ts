export const getAllParams = (url: string): Record<string, string> => {
	const paramsString = url.slice(1);
	const decodedParams = decodeURI(paramsString);
	const params = decodedParams.split('&');
	const parsedParams: { [key: string]: string } = {};
	params.forEach((el) => {
		const keyValueSlice = el.split('=');
		parsedParams[keyValueSlice[0]] = keyValueSlice[1];
	});

	return parsedParams;
};

export const syncURL = (params: Record<string, string>) => {
	const paramsSlice = Object.entries(params);
	const stage = paramsSlice.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
	const finalParams = stage.join('&');
	const finalURL = `?${finalParams}`;
	window.history.pushState({}, '', finalURL);
};
