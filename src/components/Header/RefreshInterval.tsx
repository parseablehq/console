import { Button, Menu, Text, Tooltip, px } from '@mantine/core';
import { IconRefresh, IconRefreshOff } from '@tabler/icons-react';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import { useEffect, useMemo, useRef } from 'react';

import type { FC } from 'react';
import { REFRESH_INTERVALS } from '@/constants/timeConstants';
import _ from 'lodash';
import classes from './styles/LogQuery.module.css';
import ms from 'ms';

const { setRefreshInterval, getCleanStoreForRefetch } = logsStoreReducers;
const { syncTimeRange } = appStoreReducers;
const RefreshInterval: FC = () => {
	const [, setAppStore] = useAppStore(() => null);
	const [refreshInterval, setLogsStore] = useLogsStore((store) => store.refreshInterval);
	const Icon = useMemo(() => (refreshInterval ? IconRefresh : IconRefreshOff), [refreshInterval]);
	const timerRef = useRef<NodeJS.Timer | null>(null);

	const onSelectedInterval = (interval: number | null) => {
		setLogsStore((store) => setRefreshInterval(store, interval));
	};

	useEffect(() => {
		const timerInterval = timerRef.current;
		const clearIntervalInstance = () => {
			if (timerInterval !== null) {
				try {
					clearInterval(timerInterval);
					timerRef.current = null;
				} catch (e) {
					console.log(e);
				}
			}
		};

		clearIntervalInstance();
		if (refreshInterval !== null) {
			const intervalId = setInterval(() => {
				setAppStore(syncTimeRange);
				setLogsStore(getCleanStoreForRefetch);
			}, refreshInterval);
			timerRef.current = intervalId;
		}

		return () => (timerRef.current ? clearInterval(timerRef.current) : _.noop());
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
							<Text style={{ fontSize: '0.65rem', fontWeight: 500 }} c="#495057">
								{ms(interval)}
							</Text>
						</Menu.Item>
					);
				})}

				{refreshInterval !== null && (
					<Menu.Item onClick={() => onSelectedInterval(null)}>
						<Text style={{ fontSize: '0.65rem', fontWeight: 500 }} c="#495057">
							Off
						</Text>
					</Menu.Item>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

export default RefreshInterval;
