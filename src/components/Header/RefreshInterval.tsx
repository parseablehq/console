import useMountedState from '@/hooks/useMountedState';
import { REFRESH_INTERVALS, useHeaderContext } from '@/layouts/MainLayout/Context';
import { Button, Menu, Text, px } from '@mantine/core';
import { IconRefresh, IconRefreshOff } from '@tabler/icons-react';
import ms from 'ms';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useLogQueryStyles } from './styles';

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

	const { classes } = useLogQueryStyles();
	const { intervalBtn } = classes;

	return (
		<Menu withArrow>
			<Menu.Target>
				<Button className={intervalBtn} rightIcon={<Icon size={px('1.2rem')} stroke={1.5} />}>
					<Text>{selectedInterval ? ms(selectedInterval) : 'Off'}</Text>
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
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
