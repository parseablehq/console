import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Button, Menu, Text, Tooltip, px } from '@mantine/core';
import { IconRefresh, IconRefreshOff } from '@tabler/icons-react';
import ms from 'ms';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { REFRESH_INTERVALS } from '@/constants/timeConstants';
import classes from './styles/LogQuery.module.css'


const RefreshInterval: FC = () => {

	const {
		state: { subRefreshInterval },
	} = useHeaderContext();

	const [selectedInterval, setSelectedInterval] = useMountedState<number | null>(subRefreshInterval.get());

	useEffect(() => {
		const listener = subRefreshInterval.subscribe((interval) => {
			setSelectedInterval(interval);
		});

		return () => listener();
	}, []);

	const Icon = useMemo(() => (selectedInterval ? IconRefresh : IconRefreshOff), [selectedInterval]);

	const onSelectedInterval = (interval: number | null) => {
		subRefreshInterval.set(interval);
	};

	const { intervalbtn } = classes;

	return (
		<Menu withArrow>
			<Menu.Target>
				<Tooltip label="Refresh Interval">
					<Button className={intervalbtn} leftSection={<Icon size={px('1.2rem')} stroke={1.5} />}>
						{selectedInterval ? ms(selectedInterval) : 'Off'}
					</Button>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown
				style={{
					zIndex: 1000,
				}}>
				{REFRESH_INTERVALS.map((interval) => {
					if (interval === selectedInterval) return null;

					return (
						<Menu.Item key={interval} onClick={() => onSelectedInterval(interval)}>
							<Text>{ms(interval)}</Text>
						</Menu.Item>
					);
				})}

				{selectedInterval !== null && (
					<Menu.Item onClick={() => onSelectedInterval(null)}>
						<Text>Off</Text>
					</Menu.Item>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

export default RefreshInterval;
