export function paramsParser(queryParams: Record<string, string>) {
	for (let i in queryParams) {
		const parsedParams = `${i}=${queryParams[i]}`;
		return parsedParams;
	}
}
