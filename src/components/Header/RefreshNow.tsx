import { px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { useCallback, type FC } from 'react';
import { useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
import IconButton from '../Button/IconButton';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const { getCleanStoreForRefetch } = logsStoreReducers;
const { setCleanAppStore } = appStoreReducers;

const renderRefreshIcon = () => <IconReload size={px('1rem')} stroke={1.5} />;

const RefreshNow: FC = () => {
	const [, setLogsStore] = useLogsStore((_store) => null);
	const [, setAppStore] = useAppStore((_store) => null);

	const onRefresh = useCallback(() => {
		setAppStore((store) => setCleanAppStore(store));
		setLogsStore((store) => getCleanStoreForRefetch(store));
	}, []);
	return <IconButton size={38} renderIcon={renderRefreshIcon} onClick={onRefresh} tooltipLabel="Refresh now" />;
};

export default RefreshNow;
