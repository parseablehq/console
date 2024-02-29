import { Button, Tooltip, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import type { FC } from 'react';
import classes from './styles/LogQuery.module.css';

type RefreshNowProps = {
	onRefresh: () => void;
};

const RefreshNow: FC<RefreshNowProps> = (props) => {
	const { refreshNowBtn } = classes;

	return (
		<Tooltip label="Refresh">
			<Button className={refreshNowBtn} onClick={props.onRefresh}>
				<IconReload size={px('1.2rem')} stroke={1.5} />
			</Button>
		</Tooltip>
	);
};

export default RefreshNow;
