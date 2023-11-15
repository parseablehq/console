import { ActionIcon, Tooltip } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const Reload: FC = () => {
	const navigate = useNavigate();

	return (
		<Tooltip label="Refresh" withArrow position="left">
			<ActionIcon variant="default"  radius={'md'} size={'lg'} onClick={() => navigate(0)}>
				<IconReload stroke={1.5} />
			</ActionIcon>
		</Tooltip>
	);
};

export default Reload;
