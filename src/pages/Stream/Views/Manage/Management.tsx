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
import { useGetStreamInfo } from '@/hooks/useGetStreamInfo';
import { useHotTier } from '@/hooks/useHotTier';

const Management = (props: { schemaLoading: boolean }) => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [instanceConfig] = useAppStore((store) => store.instanceConfig);
	const [userAccessMap] = useAppStore((store) => store.userAccessMap);
	const { hasAlertsAccess, hasSettingsAccess } = userAccessMap;
	const getStreamAlertsConfig = useAlertsQuery(currentStream || '', hasAlertsAccess);
	const getStreamStats = useLogStreamStats(currentStream || '');
	const getRetentionConfig = useRetentionQuery(currentStream || '', hasSettingsAccess);
	const getStreamInfo = useGetStreamInfo(currentStream || '', currentStream !== null);
	const hotTierFetch = useHotTier(currentStream || '', hasSettingsAccess);

	// todo - handle loading and error states separately
	const isAlertsLoading = getStreamAlertsConfig.isError || getStreamAlertsConfig.isLoading;
	const isRetentionLoading = getRetentionConfig.getLogRetentionIsLoading || instanceConfig === null;
	const isHotTierLoading = hotTierFetch.getHotTierInfoLoading;

	return (
		<Stack style={{ padding: '1rem', paddingTop: '0', height: '90%' }}>
			<DeleteStreamModal />
			<Stack style={{ flexDirection: 'row', height: '40%' }} gap={24}>
				<Stats
					isLoading={getStreamStats.getLogStreamStatsDataIsLoading}
					isError={getStreamStats.getLogStreamStatsDataIsError}
				/>
				<Info isLoading={getStreamInfo.getStreamInfoLoading} isError={getStreamInfo.getStreamInfoError} />
			</Stack>
			<Stack style={{ flexDirection: 'row', height: '57%' }} gap={24}>
				<Stack w="49.4%">
					<Settings
						isLoading={isHotTierLoading || isRetentionLoading}
						updateRetentionConfig={getRetentionConfig.updateLogStreamRetention}
						updateHotTierInfo={hotTierFetch.updateHotTier}
						deleteHotTierInfo={hotTierFetch.deleteHotTier}
						isDeleting={hotTierFetch.isDeleting}
						isUpdating={hotTierFetch.isUpdating}
						isRetentionError={getRetentionConfig.getLogRetentionIsError}
						hasSettingsAccess={hasSettingsAccess}
					/>
				</Stack>
				<Alerts
					isLoading={isAlertsLoading}
					schemaLoading={props.schemaLoading}
					updateAlerts={getStreamAlertsConfig.updateLogStreamAlerts}
					isError={getStreamAlertsConfig.isError}
					hasAlertsAccess={hasAlertsAccess}
				/>
			</Stack>
		</Stack>
	);
};

export default Management;
