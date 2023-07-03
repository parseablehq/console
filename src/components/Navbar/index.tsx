import { LOGS_ROUTE, QUERY_ROUTE } from '@/constants/routes';
import useMountedState from '@/hooks/useMountedState';
import type { NavbarProps as MantineNavbarProps } from '@mantine/core';
import { Navbar as MantineNavbar, Tooltip, UnstyledButton, px } from '@mantine/core';
import { IconFileReport, IconCodeCircle2} from '@tabler/icons-react';
import type { FC } from 'react';
import { useNavbarStyles } from './styles';
import { useNavigate } from 'react-router-dom';

const links = [{ icon: IconFileReport, label: 'Logs', pathname: LOGS_ROUTE }, { icon: IconCodeCircle2, label: 'Query', pathname: QUERY_ROUTE }];

type Link = (typeof links)[number];

type NavbarProps = Omit<MantineNavbarProps, 'children'>;

const Navbar: FC<NavbarProps> = (props) => {
	const [active, setActive] = useMountedState(links[0].label);
	const nav = useNavigate();

	const onLinkSelect = (link: Link) => {
		setActive(link.label);
		nav({
			pathname: link.pathname,
		});
	};

	const { classes } = useNavbarStyles();
	const { container } = classes;

	return (
		<MantineNavbar {...props} withBorder={false} zIndex={1}>
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
				<link.icon size={px('1.4rem')} stroke={1.7} />
			</UnstyledButton>
		</Tooltip>
	);
};
