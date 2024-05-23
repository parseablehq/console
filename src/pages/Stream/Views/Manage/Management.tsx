import { Stack } from '@mantine/core';
import classes from '../../styles/Management.module.css';
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

const Management = (props: { schemaLoading: boolean }) => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const getStreamAlertsConfig = useAlertsQuery(currentStream || '');
	const getStreamStats = useLogStreamStats(currentStream || '');
	const getRetentionConfig = useRetentionQuery(currentStream || '');
	const { getCacheError, updateCacheStatus } = useCacheToggle(currentStream || '');

	// todo - handle loading and error states separately
	const isStatsLoading = getStreamStats.getLogStreamStatsDataIsLoading || getStreamStats.getLogStreamStatsDataIsError;
	const isAlertsLoading = getStreamAlertsConfig.isError || getStreamAlertsConfig.isLoading;
	const isSettingsLoading = getRetentionConfig.getLogRetentionIsLoading || getRetentionConfig.getLogRetentionIsError;
	return (
		<Stack className={classes.viewConatiner}>
			<DeleteStreamModal />
			<Stack style={{ flexDirection: 'row', height: '50%' }} gap={24}>
				<Stats isLoading={isStatsLoading} />
				<Info isLoading={false} />
			</Stack>
			<Stack style={{ flexDirection: 'row', height: '50%' }} gap={24}>
				<Settings
					isLoading={isSettingsLoading}
					getCacheError={getCacheError}
					updateCacheStatus={updateCacheStatus}
					updateRetentionConfig={getRetentionConfig.updateLogStreamRetention}
				/>
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
