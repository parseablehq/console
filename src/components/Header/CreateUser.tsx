import { Button, Tooltip, px } from '@mantine/core';
import {  IconUserPlus } from '@tabler/icons-react';
import type { FC } from 'react';
import classes from './LogQuery.module.css';
import { useHeaderContext } from '@/layouts/MainLayout/Context';

const CreateUser: FC = () => {
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
        style={{ color: 'white', backgroundColor: 'black' }}
        withArrow
        onClick={handleOpen}
        position="left">
        <Button variant="default" className={refreshNowBtn} aria-label="create user">
            <IconUserPlus stroke={1.5} />
        </Button>
    </Tooltip>
	);
};

export default CreateUser;
