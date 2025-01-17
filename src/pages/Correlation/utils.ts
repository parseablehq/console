import dayjs from 'dayjs';

const calculateNumBins = (interval: number) => {
	const totalMinutes = interval / (1000 * 60);
	return Math.trunc(totalMinutes < 10 ? totalMinutes : totalMinutes < 60 ? 10 : 60);
};

export const createStreamQueries = (
	streams: string[],
	startTime: string | Date,
	endTime: string | Date,
	interval: number,
) => {
	const numBins = calculateNumBins(interval);

	return streams.map((streamKey) => ({
		stream: streamKey,
		startTime: dayjs(startTime).toISOString(),
		endTime: dayjs(endTime).add(1, 'minute').toISOString(),
		numBins,
	}));
};

export const fetchStreamData = async (
	queries: any[],
	fetchGraphDataMutation: any,
	setMultipleStreamData: React.Dispatch<React.SetStateAction<any>>,
) => {
	try {
		const results = await Promise.all(queries.map((queryData) => fetchGraphDataMutation.mutateAsync(queryData)));

		setMultipleStreamData((prevData: any) => {
			const newData = { ...prevData };
			results.forEach((result, index) => {
				newData[queries[index].stream] = result;
			});
			return newData;
		});
	} catch (error) {
		console.error('Error fetching queries:', error);
	}
};
