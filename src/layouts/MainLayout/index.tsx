import { PrimaryHeader } from '@/components/Header';
import Navbar from '@/components/Navbar';
import { NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Box } from '@mantine/core';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { heights } from '@/components/Mantine/sizing';
import { useAppStore } from './providers/AppProvider';

const MainLayout: FC = () => {
	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized ? PRIMARY_HEADER_HEIGHT : 0;
	const navbarWidth = !maximized ? NAVBAR_WIDTH : 0;
	return (
		<Box style={{ width: '100vw', minWidth: 1000 }}>
			<PrimaryHeader />
			<Box style={{ display: 'flex', height: `calc(${heights.full} - ${primaryHeaderHeight}px)` }}>
				<Navbar />
				<Box
					style={{
						width: `calc(100% - ${navbarWidth}px)`,
						display: 'flex',
						flexDirection: 'column',
						transition: 'width 0.4s ease-in-out',
					}}>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
};

export default MainLayout;
