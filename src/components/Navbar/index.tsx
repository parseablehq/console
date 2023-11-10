import { useEffect } from 'react';
import { Tooltip, UnstyledButton, Stack, rem, Text, Box, Image, ActionIcon } from '@mantine/core';
import {
	IconZoomCode,
	IconTableShortcut,
	IconReportAnalytics,
	IconChevronRight,
	IconInfoHexagon,
	IconUser,
	IconLogout,
	IconUsersGroup,
} from '@tabler/icons-react';
import classes from './Navbar.module.css';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { useGetUserRole } from '@/hooks/useGetUserRoles';
import { getStreamsSepcificAccess, getUserSepcificStreams } from './rolesHandler';
import { AppContext, PageOption } from '@/@types/parseable/api/query';
import InfoModal from './infoModal';
import { useDisclosure } from '@mantine/hooks';
const baseURL = import.meta.env.VITE_PARSEABLE_URL ?? '/';

interface NavbarLinkProps {
	icon: typeof IconZoomCode;
	label: string;
	active?: boolean;
	onClick?(): void;
	collapsed: boolean;
}

export const onSignOut = () => {
	Cookies.remove('session');
	Cookies.remove('username');

	window.location.href = `${baseURL}api/v1/o/logout?redirect=${window.location.origin}/login`;
};

export const navigatetoHome = () => {
	const navigateTo = useNavigate();
	navigateTo('/');
};

function NavbarLink({ icon: Icon, label, active, onClick, collapsed }: NavbarLinkProps) {
	return (
		<Tooltip label={label} position="right" transitionProps={{ duration: 0 }} disabled={!collapsed}>
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
	{ icon: IconZoomCode, label: 'SQL', pathname: '/sql', requiredAccess: ['Query', 'GetSchema'] },
	{ icon: IconTableShortcut, label: 'Explore', pathname: '/explore', requiredAccess: ['Query', 'GetSchema'] },
	{ icon: IconReportAnalytics, label: 'Management', pathname: '/management', requiredAccess: ['GetStats', 'PutAlert'] },
];

export default function Navbar() {
	const {
		state: { subAppContext },
	} = useHeaderContext();

	const navigateTo = useNavigate();
	const location = useLocation();
	const { streamName } = useParams();

	const username = Cookies.get('username');

	const [openedAboutInfo, { open: openAboutInfo, close: closeAboutInfo }] = useDisclosure(false);
	const [collapsed, setCollapsed] = useMountedState(true);
	const [appContext, setAppContext] = useMountedState<AppContext>(subAppContext.get());

	const { data: streams, error, getData, resetData: resetStreamArray } = useGetLogStreamList();
	const { data: userRoles, getRoles, resetData } = useGetUserRole();

	useEffect(() => {
		if (username) {
			getRoles(username);
		} else {
			onSignOut();
		}

		if (location.pathname) {
			const path = location.pathname.split('/');
			if (path[1] !== '') {
				subAppContext.set((prev) => ({
					...prev,
					activePage: `/${path[1]}`,
				}));
			} else {
				subAppContext.set((prev) => ({
					...prev,
					activePage: '/',
				}));
			}
		}
		const subAppContextListener = subAppContext.subscribe((value) => {
			if (value.activePage && value.selectedStream && value.activePage !== '/' && value.activePage !== '/team') {
				navigateTo(`${value.activePage}/${value.selectedStream}`, {
					state: value,
				});
			}
			if (value.activePage && (value.activePage === '/' || value.activePage === '/team')) {
				navigateTo(value.activePage, {
					state: value,
				});
			}

			setAppContext(value);
		});

		return () => {
			subAppContextListener();
		};
	}, []);

	useEffect(() => {
		if (streams && userRoles) {
			const userSpecificStreams = getUserSepcificStreams(userRoles, streams);

			if (userSpecificStreams.length === 0) {
				onSignOut();
			}

			if (!streamName || !userSpecificStreams.includes(streamName)) {
				subAppContext.set((prev) => {
					const action = getStreamsSepcificAccess(userRoles, userSpecificStreams[0]);
					return {
						selectedStream: userSpecificStreams[0],
						userSpecificStreams: userSpecificStreams,
						userRoles,
						action,
						activePage: prev.activePage,
					};
				});
			} else if (streamName && userSpecificStreams.includes(streamName)) {
				subAppContext.set((prev) => {
					const action = getStreamsSepcificAccess(userRoles, streamName);
					return {
						selectedStream: streamName,
						userSpecificStreams,
						userRoles,
						action,
						activePage: prev.activePage,
					};
				});
			}
		}
	}, [userRoles, streams]);

	const onPageChange = (page: PageOption) => {
		if (appContext.selectedStream) {
			subAppContext.set((prev) => ({
				...prev,
				activePage: page,
			}));
		}
	};

	const links = data.map((link) => {
		if (link.requiredAccess && !appContext.action?.some((access: string) => link.requiredAccess.includes(access))) {
			return null;
		}
		return (
			<NavbarLink
				{...link}
				key={link.label}
				active={link.pathname === appContext.activePage}
				onClick={() => onPageChange(link.pathname as PageOption)}
				collapsed={collapsed}
			/>
		);
	});
	return (
		<Box>
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
					}}
					className={classes.imageContainer}>
					<Image src={'/src/assets/images/brand/logo-circle.svg'} w={50} />
					<Image src={'/src/assets/images/brand/logo-text.svg'} w={115} />
				</UnstyledButton>

				<div className={classes.navbarMain}>
					<Stack justify="center" gap={5}>
						{links}
					</Stack>
				</div>

				<Stack justify="center" gap={5}>
					{!appContext.action?.some((access: string) => ['ListUser'].includes(access)) ? null : (
						<NavbarLink
							icon={IconUsersGroup}
							label="Team"
							collapsed={collapsed}
							onClick={() => onPageChange('/team')}
							active={appContext.activePage === '/team'}
						/>
					)}
					<NavbarLink icon={IconInfoHexagon} label="About" collapsed={collapsed} onClick={openAboutInfo} />
					<NavbarLink icon={IconUser} label={username ?? ''} collapsed={collapsed} />
					<NavbarLink icon={IconLogout} label="Logout" collapsed={collapsed} onClick={onSignOut} />
				</Stack>
				<InfoModal opened={openedAboutInfo} close={closeAboutInfo} />
			</nav>

			<ActionIcon
				radius={'xl'}
				size={'sm'}
				className={classes.collapseButton}
				style={
					collapsed
						? {
								left: '69px',
						  }
						: {
								left: '189px',
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
