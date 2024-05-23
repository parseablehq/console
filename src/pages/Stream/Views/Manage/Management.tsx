import { Stack } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import Alerts from './Alerts';
import { useGetAlerts } from '@/hooks/useAlertsEditor';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import Settings from './Settings';
import Stats from './Stats';
import { useLogStreamStats } from '@/hooks/useLogStreamStats';
import Info from './Info';

const Management = (props: {schemaLoading: boolean}) => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const getStreamAlertsConfig = useGetAlerts(currentStream || '');
	const getStreamStats = useLogStreamStats(currentStream || '')

	// todo - handle loading and error states separately
	const isStatsLoading = getStreamStats.getLogStreamStatsDataIsLoading || getStreamStats.getLogStreamStatsDataIsError
	const isAlertsLoading = getStreamAlertsConfig.isError || getStreamAlertsConfig.isLoading
	return (
		<Stack className={classes.viewConatiner}>
			<Stack style={{ flexDirection: 'row', height: '50%' }} gap={24}>
				<Stats isLoading={isStatsLoading} />
				<Info isLoading={false} />
			</Stack>
			<Stack style={{ flexDirection: 'row', height: '50%' }} gap={24}>
				<Settings isLoading={false}/>
				<Alerts isLoading={isAlertsLoading} schemaLoading={props.schemaLoading}/>
			</Stack>
		</Stack>
	);
};

export default Management;
