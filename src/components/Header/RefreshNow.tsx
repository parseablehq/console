import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Button } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import classes from './LogQuery.module.css';

const RefreshNow: FC = () => {
	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();

	const onRefresh = () => {
		if (subLogSelectedTimeRange.get().state === 'fixed') {
			const now = dayjs();
			const timeDiff = subLogQuery.get().endTime.getTime() - subLogQuery.get().startTime.getTime();
			subLogQuery.set((state) => {
				state.startTime = now.subtract(timeDiff).toDate();
				state.endTime = now.toDate();
			});
		}
	};
	const { refreshNowBtn } = classes;

	return (
		<Button className={refreshNowBtn} onClick={onRefresh}>
			<IconReload  stroke={1.5} />
		</Button>
	);
};

export default RefreshNow;
