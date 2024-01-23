import { LogStreamRetention, LogStreamStat } from '@/@types/parseable/api/stream';
import { getLogStreamRetention, getLogStreamStats } from '@/api/logStream';
import { useCallback, useState } from 'react';

type MetaData = {
	[key: string]: {
		stats: LogStreamStat | {};
		retention: LogStreamRetention | [];
	};
};

// until dedicated endpoint been provided - fetch one by one
export const useGetStreamMetadata = () => {
	const [isLoading, setLoading] = useState<Boolean>(false);
	const [error, setError] = useState<Boolean>(false);
	const [metaData, setMetadata] = useState<MetaData | null>(null);

	const getStreamMetadata = useCallback(async (streams: string[]) => {
		setLoading(true);
		try {
			// stats
			const allStatsReqs = streams.map((stream) => getLogStreamStats(stream));
			const allStatsRes = await Promise.all(allStatsReqs);

			// retention
			const allretentionReqs = streams.map((stream) => getLogStreamRetention(stream));
			const allretentionRes = await Promise.all(allretentionReqs);

			const metadata = streams.reduce((acc, stream, index) => {
				return {
					...acc,
					[stream]: { stats: allStatsRes[index]?.data || {}, retention: allretentionRes[index]?.data || [] },
				};
			}, {});
			setMetadata(metadata);
		} catch {
			setError(true);
			setMetadata(null);
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		isLoading,
		error,
		getStreamMetadata,
		metaData,
	};
};
