import { Stack } from '@mantine/core';
import Alerts from './Alerts';
import useAlertsQuery from '@/hooks/useAlertsEditor';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import Settings from './Settings';
import Stats from './Stats';
import { useLogStreamStats } from '@/hooks/useLogStreamStats';
import Info from './Info';
import DeleteStreamModal from '../../components/DeleteStreamModal';
import { useRetentionQuery } from '@/hooks/useRetentionEditor';
import { useCacheToggle } from '@/hooks/useCacheToggle';
import { useGetStreamInfo } from '@/hooks/useGetStreamInfo';

const Management = (props: { schemaLoading: boolean }) => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [instanceConfig] = useAppStore((store) => store.instanceConfig);
	const getStreamAlertsConfig = useAlertsQuery(currentStream || '');
	const getStreamStats = useLogStreamStats(currentStream || '');
	const getRetentionConfig = useRetentionQuery(currentStream || '');
	const { getCacheError, updateCacheStatus } = useCacheToggle(currentStream || '');
	const getStreamInfo = useGetStreamInfo(currentStream || '');

	// todo - handle loading and error states separately
	const isStatsLoading = getStreamStats.getLogStreamStatsDataIsLoading || getStreamStats.getLogStreamStatsDataIsError;
	const isAlertsLoading = getStreamAlertsConfig.isError || getStreamAlertsConfig.isLoading;
	const isSettingsLoading = getRetentionConfig.getLogRetentionIsLoading || getRetentionConfig.getLogRetentionIsError || instanceConfig === null;
	const isStreamInfoLoading = getStreamInfo.getStreamInfoLoading || getStreamInfo.getStreamInfoError;
	return (
		<Stack style={{ padding: '1rem', paddingTop: '0', height: '90%'}}>
			<DeleteStreamModal />
			<Stack style={{ flexDirection: 'row', height: '40%' }} gap={24}>
				<Stats isLoading={isStatsLoading} />
				<Info isLoading={isStreamInfoLoading} />
			</Stack>
			<Stack style={{ flexDirection: 'row', height: '57%' }} gap={24}>
				<Stack w="49.4%">
					<Settings
						isLoading={isSettingsLoading}
						getCacheError={getCacheError}
						updateCacheStatus={updateCacheStatus}
						updateRetentionConfig={getRetentionConfig.updateLogStreamRetention}
					/>
				</Stack>
				<Alerts
					isLoading={isAlertsLoading}
					schemaLoading={props.schemaLoading}
					updateAlerts={getStreamAlertsConfig.updateLogStreamAlerts}
				/>
			</Stack>
		</Stack>
	);
};

export default Management;
