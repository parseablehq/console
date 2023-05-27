import { DASHBOARD_ROUTE } from '@/constants/routes';
import useMountedState from '@/hooks/useMountedState';
import type { NavbarProps as MantineNavbarProps } from '@mantine/core';
import { Navbar as MantineNavbar, Tooltip, UnstyledButton } from '@mantine/core';
import { IconLayoutDashboard } from '@tabler/icons-react';
import type { FC } from 'react';
import { useNavbarStyles } from './styles';

const links = [{ icon: IconLayoutDashboard, label: 'Dashboard', pathname: DASHBOARD_ROUTE }];

type Link = (typeof links)[number];

type NavbarProps = Omit<MantineNavbarProps, 'children'>;

const Navbar: FC<NavbarProps> = (props) => {
	const [active, setActive] = useMountedState(links[0].label);

	const onLinkSelect = (link: Link) => {
		setActive(link.label);
	};

	const { classes } = useNavbarStyles();
	const { container } = classes;

	return (
		<MantineNavbar {...props} withBorder={false}>
			<MantineNavbar.Section grow className={container}>
				{links.map((link) => {
					return (
						<NavbarLink
							key={link.label}
							link={link}
							isActive={link.label === active}
							setActive={() => onLinkSelect(link)}
						/>
					);
				})}
			</MantineNavbar.Section>
		</MantineNavbar>
	);
};

export default Navbar;

type NavbarLinkProps = {
	link: Link;
	isActive: boolean;
	setActive: () => void;
};

const NavbarLink: FC<NavbarLinkProps> = (props) => {
	const { link, isActive, setActive } = props;

	const { classes, cx } = useNavbarStyles();
	const { linkBtnStyle, linkBtnActiveStyle } = classes;

	return (
		<Tooltip label={link.label} position="right" withArrow transitionProps={{ duration: 0 }} key={link.label}>
			<UnstyledButton onClick={setActive} className={cx(linkBtnStyle, { [linkBtnActiveStyle]: isActive })}>
				<link.icon size="1.4rem" stroke={1.7} />
			</UnstyledButton>
		</Tooltip>
	);
};
