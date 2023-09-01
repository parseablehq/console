import useMountedState from '@/hooks/useMountedState';
// import { REFRESH_INTERVALS, useHeaderContext } from '@/layouts/MainLayout/Context';
import { Button, Menu, Text, } from '@mantine/core';
import {  IconTableDown } from '@tabler/icons-react';

import type { FC } from 'react';


import { useLogQueryStyles } from './styles';

const LimitLog: FC = () => {
	// const {
	// 	state: { subRefreshInterval },
	// } = useHeaderContext();
	const [limit , setLimit] = useMountedState<number | null>(1000);

	// const [selectedInterval, setSelectedInterval] = useMountedState<number | null>(subRefreshInterval.get());

	// useEffect(() => {
	// 	const listener = subRefreshInterval.subscribe((interval) => {
	// 		setSelectedInterval(interval);
	// 	});

	// 	return () => listener();
	// }, []);

	// const Icon = useMemo(() => (selectedInterval ? IconRefresh : IconRefreshOff), [selectedInterval]);

	// const onSelectedInterval = (interval: number | null) => {
	// 	subRefreshInterval.set(interval);

	// };

	const { classes } = useLogQueryStyles();
	const { intervalBtn } = classes;

	return (
		<Menu withArrow>
			<Menu.Target>
				<Button className={intervalBtn} leftIcon={<IconTableDown/>}>
					{/* <Text>{selectedInterval ? ms(selectedInterval) : 'Off'}</Text>
					 */}
					<Text>{limit} rows</Text>
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{/* {REFRESH_INTERVALS.map((interval) => {
					if (interval === selectedInterval) return null;

					return (
						<Menu.Item key={interval} onClick={() => onSelectedInterval(interval)}>
							<Text>{ms(interval)}</Text>
						</Menu.Item>
					);
				})} */}


				{/* {selectedInterval !== null && (
					<Menu.Item onClick={() => onSelectedInterval(null)}>
						<Text>Off</Text>
					</Menu.Item>
				)} */}
				<Menu.Item onClick={() => setLimit(1000)}>
					<Text>1000</Text>
				</Menu.Item>
				<Menu.Item onClick={() => setLimit(5000)}>
					<Text>5000</Text>
				</Menu.Item>
				<Menu.Item onClick={() => setLimit(10000)}>
					<Text>10000</Text>
				</Menu.Item>
				<Menu.Item onClick={() => setLimit(20000)}>
					<Text>20000</Text>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export default LimitLog;
