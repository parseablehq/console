import logoInvert from '@/assets/images/brand/logo-invert.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { HEADER_HEIGHT } from '@/constants/theme';
import type { HeaderProps as MantineHeaderProps } from '@mantine/core';
import { Box, Image, Header as MantineHeader, Burger } from '@mantine/core';
import { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHeaderStyles } from './styles';
import SubHeader from './SubHeader';
import {useHeaderContext} from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';

type HeaderProps = Omit<MantineHeaderProps, 'children' | 'height' | 'className'>;

const Header: FC<HeaderProps> = (props) => {
	const { classes } = useHeaderStyles();
	const { container, logoContainer, burgerIcon ,navContainer} = classes;
	const {
		state: { subNavbarTogle },
	} = useHeaderContext();
	const [isSubNavbarOpen, setIsSubNavbarOpen] = useMountedState(false);
	useEffect(() => {
		const listener = subNavbarTogle.subscribe(setIsSubNavbarOpen);
		return () => {
			listener();
		};
	}, []);

	return (
		<MantineHeader {...props} className={container} height={HEADER_HEIGHT} p={0} withBorder>
			<Box className={logoContainer}>
				<Link to={HOME_ROUTE} style={{ height: 25 }}>
					<Image maw={HEADER_HEIGHT * 2.5} mx="auto" src={logoInvert} alt="Parseable Logo" />
				</Link>
				<Burger
					className={burgerIcon}
					opened={isSubNavbarOpen}
					onClick={() =>subNavbarTogle.set((state) => !state)}
					size={"sm"}
				/>
			</Box>
		<Box className={navContainer}>
			<SubHeader/>
		</Box>

		</MantineHeader>
	);
};


export default Header;
