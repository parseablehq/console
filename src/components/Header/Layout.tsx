import { Box } from '@mantine/core';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import classes from './Header.module.css';

const HeaderLayout: FC<any> = () => {
	const { container, navContainer } = classes;

	return (
		<header className={container}>
			<Box className={navContainer}>
				<Outlet />
			</Box>
		</header>
	);
};

export default HeaderLayout;
