import { useState } from 'react';
import { Tooltip, UnstyledButton, Stack, rem, Text, Box, Image, ActionIcon } from '@mantine/core';
import {
	IconHome2,
	IconUser,
	IconLogout,
	IconZoomCode,
	IconTableShortcut,
	IconReportAnalytics,
	IconInfoHexagon,
	IconChevronRight,
} from '@tabler/icons-react';
import classes from './Navbar.module.css';

interface NavbarLinkProps {
	icon: typeof IconHome2;
	label: string;
	active?: boolean;
	onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
	return (
		<Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
			<UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
				<Box style={{ width: rem(20), height: rem(20) }}>
					<Icon stroke={1.5} />
				</Box>
				<Text
					style={{
						overflow: 'hidden',
					}}>
					{label}
				</Text>
			</UnstyledButton>
		</Tooltip>
	);
}
const data = [
	{ icon: IconZoomCode, label: 'SQL', pathname: '/query', requiredAccess: ['Query', 'GetSchema'] },
	{ icon: IconTableShortcut, label: 'Explore', pathname: '/logs', requiredAccess: ['Query', 'GetSchema'] },
	{ icon: IconReportAnalytics, label: 'Management', pathname: '/stats', requiredAccess: ['GetStats', 'PutAlert'] },
];

export default function Navbar() {
	const [active, setActive] = useState(2);
	const [collapsed, setCollapsed] = useState(false);

	const links = data.map((link, index) => (
		<NavbarLink {...link} key={link.label} active={index === active} onClick={() => setActive(index)} />
	));

	return (
		<Box
			style={{
				position: 'relative',
			}}>
			<nav
				className={classes.navbar}
				style={
					collapsed
						? {
								width: rem(80),
						  }
						: {
								width: rem(200),
						  }
				}>
				<UnstyledButton
					onClick={() => {
						setCollapsed(!collapsed);
					}}>
					<Box className={classes.imageContainer}>
						<Image src={'/src/assets/images/brand/logo.svg'} w={'200px'} />
					</Box>
				</UnstyledButton>

				<div className={classes.navbarMain}>
					<Stack justify="center" gap={5}>
						{links}
					</Stack>
				</div>

				<Stack justify="center" gap={5}>
					<NavbarLink icon={IconInfoHexagon} label="About" />
					<NavbarLink icon={IconUser} label="Admin" />
					<NavbarLink icon={IconLogout} label="Logout" />
				</Stack>
			</nav>

			<ActionIcon
				radius={'xl'}
				size={'sm'}
				className={classes.collapseButton}
				style={
					collapsed
						? {
								left: rem(80),
						  }
						: {
								left: rem(200),
						  }
				}
				onClick={() => {
					setCollapsed(!collapsed);
				}}>
				<IconChevronRight
					stroke={1.5}
					className={classes.collapseButtonIcon}
					style={
						collapsed
							? {
									rotate: '0deg',
							  }
							: {
									rotate: '180deg',
							  }
					}
				/>
			</ActionIcon>
		</Box>
	);
}
