import { Button, Tooltip, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import type { FC } from 'react';
import classes from './LogQuery.module.css';
import { useNavigate } from 'react-router-dom';

const ReloadUser: FC = () => {
	const navigate = useNavigate();
	const { refreshNowBtn } = classes;

	return (
		<Tooltip label="Refresh" style={{ color: 'white', backgroundColor: 'black' }} withArrow position="left">
			<Button className={refreshNowBtn} onClick={() => navigate(0)}>
				<IconReload size={px('1.2rem')} stroke={1.5} />
			</Button>
		</Tooltip>
	);
};

export default ReloadUser;
