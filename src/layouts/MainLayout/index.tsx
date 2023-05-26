import Header from '@/components/Header';
import { AppShell, Navbar } from '@mantine/core';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: FC = () => {
	return (
		<AppShell
			padding="md"
			navbar={
				<Navbar width={{ base: 300 }} p="xs">
					{/* Navbar content */}
				</Navbar>
			}
			header={<Header p="xs" />}
			styles={(theme) => ({
				main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
			})}>
			<Outlet />
		</AppShell>
	);
};

export default MainLayout;
