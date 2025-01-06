import { LogStreamRetention, LogStreamStat } from '@/@types/parseable/api/stream';
import { getLogStreamRetention, getLogStreamStats } from '@/api/logStream';
import { getStreamsSepcificAccess } from '@/components/Navbar/rolesHandler';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { notifyError } from '@/utils/notification';
import _ from 'lodash';
import { useCallback, useState } from 'react';

export type MetaData = {
	[key: string]: {
		stats: LogStreamStat | object;
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
			let encounteredError = false;
			try {
				// stats
				const allStatsReqs = streams.map((stream) => getLogStreamStats(stream));
				const statsResults = await Promise.allSettled(allStatsReqs);

				// Notify errors for stats
				statsResults.forEach((result, index) => {
					if (result.status === 'rejected') {
						encounteredError = true;
						notifyError({
							message: `Failed to fetch stats for stream: ${streams[index]}`,
						});
					}
				});
				// retention
				const streamsWithSettingsAccess = _.filter(streams, (stream) =>
					_.includes(getStreamsSepcificAccess(userRoles, stream), 'StreamSettings'),
				);
				const allRetentionReqs = streamsWithSettingsAccess.map((stream) => getLogStreamRetention(stream));
				const retentionResults = await Promise.allSettled(allRetentionReqs);

				// Notify errors for retention
				retentionResults.forEach((result, index) => {
					if (result.status === 'rejected') {
						encounteredError = true;
						notifyError({
							message: `Failed to fetch retention for stream: ${streamsWithSettingsAccess[index]}`,
						});
					}
				});

				// Combine results
				const metadata = streams.reduce((acc, stream, index) => {
					const statsResult = statsResults[index];
					const retentionResult = retentionResults.find((_, idx) => streamsWithSettingsAccess[idx] === stream);

					return {
						...acc,
						[stream]: {
							stats: statsResult?.status === 'fulfilled' ? statsResult.value.data : {},
							retention: retentionResult?.status === 'fulfilled' ? retentionResult.value.data : [],
						},
					};
				}, {});

				setMetadata(metadata);
				setLoading(false);
				setError(encounteredError);
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
