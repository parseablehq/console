import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import { NAVBAR_WIDTH } from '@/constants/theme';
import { Box } from '@mantine/core';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { useMainLayoutStyles } from './styles';

const MainLayout: FC = () => {
	const { classes } = useMainLayoutStyles();

	const { container, contentContainer } = classes;

	return (
		<Box className={container}>
			<Header p="xs" />
			<Box className={contentContainer}>
				<Navbar w={NAVBAR_WIDTH} />
				<Outlet />
			</Box>
		</Box>
	);
};

export default MainLayout;
