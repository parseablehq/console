import { Button, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import type { FC } from 'react';
import { useLogQueryStyles } from './styles';
import { useNavigate } from 'react-router-dom';

const ReloadUser: FC = () => {
    const navigate = useNavigate();
	const { classes } = useLogQueryStyles();
	const { refreshNowBtn } = classes;

	return (
		<Button className={refreshNowBtn} onClick={()=>navigate(0)}>
			<IconReload size={px('1.2rem')} stroke={1.5} />
		</Button>
	);
};

export default ReloadUser;
