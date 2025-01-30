import { px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { useCallback, type FC } from 'react';
import { useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
import IconButton from '../Button/IconButton';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const { getCleanStoreForRefetch } = logsStoreReducers;
const { syncTimeRange } = appStoreReducers;

const renderRefreshIcon = () => <IconReload color="#495057" size={px('1rem')} stroke={1.5} />;

const RefreshNow: FC = () => {
	const [, setLogsStore] = useLogsStore(() => null);
	const [, setAppStore] = useAppStore(() => null);

	const onRefresh = useCallback(() => {
		setAppStore((store) => syncTimeRange(store));
		setLogsStore((store) => getCleanStoreForRefetch(store));
	}, []);
	return <IconButton size={38} renderIcon={renderRefreshIcon} onClick={onRefresh} tooltipLabel="Refresh now" />;
};

export default RefreshNow;
