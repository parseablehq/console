import { Button, Menu, Text, Tooltip, px } from '@mantine/core';
import { IconRefresh, IconRefreshOff } from '@tabler/icons-react';
import ms from 'ms';
import type { FC } from 'react';
import { useMemo } from 'react';
import { REFRESH_INTERVALS } from '@/constants/timeConstants';
import classes from './styles/LogQuery.module.css'
import { useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';

const {setRefreshInterval} = logsStoreReducers;
const RefreshInterval: FC = () => {
	const [refreshInterval, setLogsStore] = useLogsStore(store => store.refreshInterval)
	const Icon = useMemo(() => (refreshInterval ? IconRefresh : IconRefreshOff), [refreshInterval]);

	const onSelectedInterval = (interval: number | null) => {
		setLogsStore(store => setRefreshInterval(store, interval))
	};

	const { intervalbtn } = classes;

	return (
		<Menu withArrow>
			<Menu.Target>
				<Tooltip label="Refresh Interval">
					<Button className={intervalbtn} leftSection={<Icon size={px('1.2rem')} stroke={1.5} />}>
						{refreshInterval ? ms(refreshInterval) : 'Off'}
					</Button>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown
				style={{
					zIndex: 1000,
				}}>
				{REFRESH_INTERVALS.map((interval) => {
					if (interval === refreshInterval) return null;

					return (
						<Menu.Item key={interval} onClick={() => onSelectedInterval(interval)}>
							<Text>{ms(interval)}</Text>
						</Menu.Item>
					);
				})}

				{refreshInterval !== null && (
					<Menu.Item onClick={() => onSelectedInterval(null)}>
						<Text>Off</Text>
					</Menu.Item>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

export default RefreshInterval;
