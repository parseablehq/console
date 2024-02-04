import { PrimaryHeader } from '@/components/Header';
import Navbar from '@/components/Navbar';
import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';
import { Box } from '@mantine/core';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { heights } from '@/components/Mantine/sizing';

const MainLayout: FC = () => {
	return (
		<Box style={{ width: '100vw', minWidth: 1000 }}>
			<PrimaryHeader p="xs" />
			<Box style={{ display: 'flex', height: `calc(${heights.full} - ${HEADER_HEIGHT}px)` }}>
				<Navbar w={NAVBAR_WIDTH} />
				<Box
					sx={{
						width: `calc(100% - ${NAVBAR_WIDTH}px)`,
						display: 'flex',
						flexDirection: 'column',
					}}>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
};

export default MainLayout;
