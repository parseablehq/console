import { Stack } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import Alerts from './Alerts';
import { useGetAlerts } from '@/hooks/useAlertsEditor';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import Settings from './Settings';
import Stats from './Stats';
import { useLogStreamStats } from '@/hooks/useLogStreamStats';
import Info from './Info';

const Management = () => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const getStreamAlertsConfig = useGetAlerts(currentStream || '');
	const getStreamStats = useLogStreamStats(currentStream || '')
	return (
		<Stack className={classes.viewConatiner}>
			<Stack style={{ flexDirection: 'row', height: '50%' }} gap={24}>
				<Stats isLoading={getStreamStats.getLogStreamStatsDataIsLoading} />
				<Info />
			</Stack>
			<Stack style={{ flexDirection: 'row', height: '50%' }} gap={24}>
				<Settings />
				<Alerts isLoading={getStreamAlertsConfig.isLoading} error={getStreamAlertsConfig.isError} />
			</Stack>
		</Stack>
	);
};

export default Management;
