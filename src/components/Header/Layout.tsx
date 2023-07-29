import logoInvert from '@/assets/images/brand/logo-invert.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { HEADER_HEIGHT } from '@/constants/theme';
import type { HeaderProps as MantineHeaderProps } from '@mantine/core';
import { Box, Image, Header as MantineHeader } from '@mantine/core';
import { FC } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useHeaderStyles } from './styles';

type HeaderProps = Omit<MantineHeaderProps, 'children' | 'height' | 'className'>;

const HeaderLayout: FC<HeaderProps> = (props) => {
	const { classes } = useHeaderStyles();
	const { container, logoContainer, navContainer, imageSty } = classes;

	return (
		<MantineHeader {...props} className={container} height={HEADER_HEIGHT} p={0} withBorder>
			<Box className={logoContainer}>
				<Link to={HOME_ROUTE}>
					<Image className={imageSty} src={logoInvert} height={24} alt="Parseable Logo" />
				</Link>
			</Box>
			<Box className={navContainer}>
				<Outlet />
			</Box>
		</MantineHeader>
	);
};

export default HeaderLayout;
