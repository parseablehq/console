import { Button, Menu, Text, Tooltip, px } from '@mantine/core';
import { IconRefresh, IconRefreshOff } from '@tabler/icons-react';
import ms from 'ms';
import type { FC } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { REFRESH_INTERVALS } from '@/constants/timeConstants';
import classes from './styles/LogQuery.module.css';
import { useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT, STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT, STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';

const { setRefreshInterval, getCleanStoreForRefetch } = logsStoreReducers;
const RefreshInterval: FC = () => {
	const [refreshInterval, setLogsStore] = useLogsStore((store) => store.refreshInterval);
	const Icon = useMemo(() => (refreshInterval ? IconRefresh : IconRefreshOff), [refreshInterval]);
	const timerRef = useRef<NodeJS.Timer | null>(null);

	const onSelectedInterval = (interval: number | null) => {
		setLogsStore((store) => setRefreshInterval(store, interval));
	};

	useEffect(() => {
		const timerInterval = timerRef.current;
		if (timerInterval !== null) {
			try {
				clearInterval(timerInterval);
				timerRef.current = null;
			} catch (e) {
				console.log(e);
			}
		}

		if (refreshInterval !== null) {
			const intervalId = setInterval(() => {
				setLogsStore(getCleanStoreForRefetch);
			}, refreshInterval);
			timerRef.current = intervalId;
		}
	}, [refreshInterval]);

	const { intervalbtn } = classes;

	return (
		<Menu withArrow>
			<Menu.Target>
				<Tooltip label="Refresh Interval">
					<Button className={intervalbtn} h="100%" leftSection={<Icon size={px('1rem')} stroke={1.5} />}>
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
