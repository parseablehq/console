import { LogStreamRetention, LogStreamStat } from '@/@types/parseable/api/stream';
import { getLogStreamRetention, getLogStreamStats } from '@/api/logStream';
import { getStreamsSepcificAccess } from '@/components/Navbar/rolesHandler';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { notifyError } from '@/utils/notification';
import _ from 'lodash';
import { useCallback, useState } from 'react';

export type MetaData = {
	[key: string]: {
		stats: LogStreamStat | {};
		retention: LogStreamRetention | [];
	};
};

// until dedicated endpoint been provided - fetch one by one
export const useGetStreamMetadata = () => {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);
	const [metaData, setMetadata] = useState<MetaData | null>(null);
	const [userRoles] = useAppStore((store) => store.userRoles);

	const getStreamMetadata = useCallback(
		async (streams: string[]) => {
			if (!userRoles) return;
			setLoading(true);
			try {
				// stats
				const allStatsReqs = streams.map((stream) => getLogStreamStats(stream));
				const allStatsRes = await Promise.all(allStatsReqs);

				// retention
				const streamsWithSettingsAccess = _.filter(streams, (stream) =>
					_.includes(getStreamsSepcificAccess(userRoles, stream), 'StreamSettings'),
				);
				const allretentionReqs = streamsWithSettingsAccess.map((stream) => getLogStreamRetention(stream));
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
				notifyError({
					message: 'Unable to fetch stream data',
				});
			} finally {
				setLoading(false);
			}
		},
		[userRoles],
	);

	return {
		isLoading,
		error,
		getStreamMetadata,
		metaData,
	};
};
