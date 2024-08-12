export function paramsParser(queryParams: Record<string, string>) {
	let parsedParams = '';

	for (const i in queryParams) {
		if (queryParams.hasOwnProperty(i)) {
			parsedParams += `${i}=${queryParams[i]}&`;
		}
	}

	if (parsedParams.endsWith('&')) {
		parsedParams = `?${parsedParams.slice(0, -1)}`;
	}
	return parsedParams;
}
