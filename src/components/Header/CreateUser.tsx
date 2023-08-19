import { Button, Tooltip, px } from '@mantine/core';
import {  IconUserPlus } from '@tabler/icons-react';
import type { FC } from 'react';
import { useLogQueryStyles } from './styles';
import { useHeaderContext } from '@/layouts/MainLayout/Context';

const CreateUser: FC = () => {
	const { classes } = useLogQueryStyles();
	const { refreshNowBtn } = classes;
	const {
		state: { subCreateUserModalTogle }
	} = useHeaderContext();


	const handleOpen = () => {
		subCreateUserModalTogle.set(true);
	};


	return (
        <Tooltip
        label={'Create new user'}
        sx={{ color: 'white', backgroundColor: 'black' }}
        withArrow
        onClick={handleOpen}
        position="left">
        <Button variant="default" className={refreshNowBtn} aria-label="create user">
            <IconUserPlus size={px('1.2rem')} stroke={1.5} />
        </Button>
    </Tooltip>
	);
};

export default CreateUser;
