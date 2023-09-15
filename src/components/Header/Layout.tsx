import { HEADER_HEIGHT } from '@/constants/theme';
import type { HeaderProps as MantineHeaderProps } from '@mantine/core';
import { Box, Header as MantineHeader } from '@mantine/core';
import { FC } from 'react';
import {  Outlet } from 'react-router-dom';
import { useHeaderStyles } from './styles';

type HeaderProps = Omit<MantineHeaderProps, 'children' | 'height' | 'className'>;

const HeaderLayout: FC<HeaderProps> = (props) => {
	const { classes } = useHeaderStyles();
	const { container, navContainer } = classes;

	return (
		<MantineHeader {...props} className={container} height={HEADER_HEIGHT} p={0} withBorder zIndex={100}>
			<Box className={navContainer}>
				<Outlet />
			</Box>
		</MantineHeader>
	);
};

export default HeaderLayout;
