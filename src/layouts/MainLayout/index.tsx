import { PrimaryHeader, SecondaryHeader } from '@/components/Header';
import Navbar from '@/components/Navbar';
import { NAVBAR_WIDTH } from '@/constants/theme';
import { Box } from '@mantine/core';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import classes from './MainLayout.module.css';

const MainLayout: FC = () => {

	const { container, contentContainer } = classes;

	return (
		<Box className={container}>
			<PrimaryHeader p="xs" />
			<Box className={contentContainer}>
				<Navbar w={NAVBAR_WIDTH} />
				<Box
					style={{
						width: `calc(100% - ${NAVBAR_WIDTH}px)`,
						display: 'flex',
						flexDirection: 'column',
					}}>
					<SecondaryHeader />
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
};

export default MainLayout;
