import { PrimaryHeader, SecondaryHeader } from '@/components/Header';
import Navbar from '@/components/Navbar';
import { Box } from '@mantine/core';
import type { FC } from 'react';

const MainLayout: FC = () => {
	return (
		<Box
			style={{
				display: 'flex',
			}}>
			<Navbar />
			<Box
				style={{
					flexGrow: 1,
				}}>
				<SecondaryHeader />
			</Box>

			{/* <Outlet /> */}
		</Box>
	);
};

export default MainLayout;
