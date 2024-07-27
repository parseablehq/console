declare module 'jq-web' {
	interface JQWeb {
		json(
			records: {
				[key: string]: any; // Use `any` if the values can be of any type. Replace `any` with a specific type if needed.
			},
			filter: string,
		): Promise<any>;
	}

	const jq: JQWeb;
	export default jq;
}