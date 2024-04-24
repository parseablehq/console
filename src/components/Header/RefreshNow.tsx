import { Button, Tooltip, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { useCallback, type FC } from 'react';
import classes from './styles/LogQuery.module.css';
import { useLogsStore, logsStoreReducers } from '@/pages/Logs/providers/LogsProvider';

const { getCleanStoreForRefetch } = logsStoreReducers;

const RefreshNow: FC = () => {
	const { refreshNowBtn } = classes;
	const [, setLogsStore] = useLogsStore((_store) => null);

	const onRefresh = useCallback(() => {
		setLogsStore((store) => getCleanStoreForRefetch(store));
	}, []);
	return (
		<Tooltip label="Refresh">
			<Button className={refreshNowBtn} onClick={onRefresh}>
				<IconReload size={px('1.2rem')} stroke={1.5} />
			</Button>
		</Tooltip>
	);
};

export default RefreshNow;
