import { Stack } from '@mantine/core';
import classes from './styles/Management.module.css';
import Alerts from './Alerts';
import { useGetAlerts } from '@/hooks/useAlertsEditor';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import Settings from './Settings';

const Management = () => {
	const [currentStream] = useAppStore(store => store.currentStream)
	const getStreamAlertsConfig =  useGetAlerts(currentStream || '');

	return (
		<Stack>
			<Alerts isLoading={getStreamAlertsConfig.isLoading} error={getStreamAlertsConfig.isError} />
			<Settings />
		</Stack>
	);
};

export default Management;
