import { Button, Tooltip, px } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import type { FC } from 'react';
import { useLogQueryStyles } from './styles';

const DocsUser: FC = () => {
	const { classes } = useLogQueryStyles();
	const { refreshNowBtn } = classes;

	return (
        <Tooltip label={'Docs'} sx={{ color: 'white', backgroundColor: 'black' }} withArrow position="left">
        <Button
            variant="default"
            className={refreshNowBtn}
            onClick={() => {
                window.open('https://www.parseable.io/docs/rbac', '_blank');
            }}>
            <IconBook2 size={px('1.2rem')} stroke={1.5} />
        </Button>
    </Tooltip>
	);
};

export default DocsUser;
