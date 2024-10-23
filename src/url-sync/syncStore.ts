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

export const syncURL = (path: string, params: Record<string, string>) => {
	const paramsSlice = Object.entries(params);
	const stage = paramsSlice.map((el) => el.join('='));
	const finalParams = encodeURI(stage.join('&'));

	const finalURL = `${path}?${finalParams}`;
	window.history.pushState({}, '', finalURL);
};
