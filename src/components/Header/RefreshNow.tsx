import { Button, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import type { FC } from 'react';
import { useLogQueryStyles } from './styles';

type RefreshNowProps = {
	onRefresh: () => void;
}

const RefreshNow: FC<RefreshNowProps> = (props) => {
	const { classes } = useLogQueryStyles();
	const { refreshNowBtn } = classes;

	return (
		<Button className={refreshNowBtn} onClick={props.onRefresh}>
			<IconReload size={px('1.2rem')} stroke={1.5} />
		</Button>
	);
};

export default RefreshNow;
