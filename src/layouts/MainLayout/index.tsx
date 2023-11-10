import { SecondaryHeader } from '@/components/Header';
import Navbar from '@/components/Navbar';
import { Box } from '@mantine/core';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: FC = () => {
	return (
		<Box
			style={{
				display: 'flex',
			}}>
			<Navbar />
			<Box
				style={{
					display: 'flex',
					flexDirection: 'column',
					flexGrow: 1,
					height: '100vh',
				}}>
				<SecondaryHeader />
				<Outlet />
			</Box>
		</Box>
	);
};

export default MainLayout;
