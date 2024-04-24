import { PrimaryHeader } from '@/components/Header';
import Navbar from '@/components/Navbar';
import { NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Box } from '@mantine/core';
import { useEffect, type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { heights } from '@/components/Mantine/sizing';
import { useAppStore, appStoreReducers } from './providers/AppProvider';

const { toggleMaximize } = appStoreReducers;

const MainLayout: FC = () => {
	const [maximized, setAppStore] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized ? PRIMARY_HEADER_HEIGHT : 0;
	const navbarWidth = !maximized ? NAVBAR_WIDTH : 0;

	useEffect(() => {
		const handleEscKeyPress = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				maximized && setAppStore(toggleMaximize);
			}
		};
		window.addEventListener('keydown', handleEscKeyPress);
		return () => {
			window.removeEventListener('keydown', handleEscKeyPress);
		};
	}, [maximized]);

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
