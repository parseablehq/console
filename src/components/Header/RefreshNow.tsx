import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Button, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useLogQueryStyles } from './styles';

const RefreshNow: FC = () => {
	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();

	const onRefresh = () => {
		if (subLogSelectedTimeRange.get().includes('last')) {
			const now = dayjs();
			const timeDiff = subLogQuery.get().endTime.getTime() - subLogQuery.get().startTime.getTime();
			subLogQuery.set((state) => {
				state.startTime = now.subtract(timeDiff).toDate();
				state.endTime = now.toDate();
			});
		}
	};
	const { classes } = useLogQueryStyles();
	const { refreshNowBtn } = classes;

	return (
		<Button className={refreshNowBtn} onClick={onRefresh}>
			<IconReload size={px('1.2rem')} stroke={1.5} />
		</Button>
	);
};

export default RefreshNow;
