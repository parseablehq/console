import { Box, Stack, Text } from '@mantine/core';
import { IconLogout, IconUser, IconBinaryTree2, IconInfoCircle, IconUserCog, IconHome } from '@tabler/icons-react';
import { FC, useCallback, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useDisclosure } from '@mantine/hooks';
import { HOME_ROUTE, LOGS_ROUTE, USERS_MANAGEMENT_ROUTE } from '@/constants/routes';
import InfoModal from './infoModal';
import { getStreamsSepcificAccess, getUserSepcificStreams } from './rolesHandler';
import Cookies from 'js-cookie';
import { useUser } from '@/hooks/useUser';
import { useLogStream } from '@/hooks/useLogStream';
import styles from './styles/Navbar.module.css';
import useCurrentRoute from '@/hooks/useCurrentRoute';
import { NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import UserModal from './UserModal';
import { signOutHandler } from '@/utils';

const navItems = [
	{
		icon: IconHome,
		label: 'Home',
		path: '/',
		route: HOME_ROUTE,
	},
	{
		icon: IconBinaryTree2,
		label: 'Stream',
		path: '/logs',
		route: LOGS_ROUTE,
	},
	{
		icon: IconUserCog,
		label: 'Users',
		path: '/users',
		route: USERS_MANAGEMENT_ROUTE,
	},
];

const navActions = [
	{
		icon: IconUser,
		label: 'User',
		key: 'user',
	},
	{
		icon: IconInfoCircle,
		label: 'About',
		key: 'about',
	},
	{
		icon: IconLogout,
		label: 'Logout',
		key: 'logout',
	},
];

const Navbar: FC = () => {
	const navigate = useNavigate();
	const { streamName } = useParams();
	const location = useLocation();
	const currentRoute = useCurrentRoute();
	const username = Cookies.get('username');
	const {
		state: { subAppContext, maximized, userSpecficStreams, userSpecificAccessMap },
		methods: { streamChangeCleanup, setUserRoles, setUserSpecficStreams, updateUserSpecificAccess },
	} = useHeaderContext();

	const selectedStream = subAppContext.get().selectedStream;
	const [userModalOpened, { toggle: toggleUserModal }] = useDisclosure(false);
	const [infoModalOpened, { toggle: toggleInfoModal }] = useDisclosure(false);

	const { getLogStreamListData } = useLogStream();

	const { getUserRolesData, getUserRolesMutation } = useUser();

	useEffect(() => {
		if (getLogStreamListData?.data && getLogStreamListData?.data.length > 0 && getUserRolesData?.data) {
			getUserRolesData?.data && setUserRoles(getUserRolesData?.data); // TODO: move user context main context
			const userStreams = getUserSepcificStreams(getUserRolesData?.data, getLogStreamListData?.data as any);
			setUserSpecficStreams(userStreams as any);
		} else {
			setUserSpecficStreams(null);
		}
		updateUserSpecificAccess(getStreamsSepcificAccess(getUserRolesData?.data));
	}, [getUserRolesData?.data, getLogStreamListData?.data]);

	useEffect(() => {
		getUserRolesMutation({ userName: username ? username : '' });
	}, [username]);

	const navigateToPage = useCallback(
		(route: string) => {
			if (route === LOGS_ROUTE) {
				if (
					!userSpecficStreams ||
					userSpecficStreams.length === 0 ||
					(streamName && !userSpecficStreams.find((stream: any) => stream.name === streamName))
				) {
					return navigate('/');
				}
				const defaultStream =
					selectedStream && selectedStream.length !== 0 ? selectedStream : userSpecficStreams[0].name;
				const stream = !streamName || streamName.length === 0 ? defaultStream : streamName;
				const path = `/${stream}/logs`;
				streamChangeCleanup(stream);

				if (path !== location.pathname) {
					navigate(path);
				}
			} else {
				return navigate(route);
			}
		},
		[userSpecficStreams, streamName],
	);

	useEffect(() => {
		if (streamName && streamName.length !== 0 && userSpecficStreams && userSpecficStreams.length !== 0) {
			navigateToPage(LOGS_ROUTE);
		}
	}, [streamName, userSpecficStreams]);

	if (maximized) return null;

	return (
		<Box>
			<nav
				className={styles.navbar}
				style={{ width: NAVBAR_WIDTH, height: `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px)` }}>
				<div className={styles.navbarMain}>
					<Stack justify="center" align="center" gap={0}>
						{navItems.map((navItem, index) => {
							if (navItem.route === USERS_MANAGEMENT_ROUTE && !userSpecificAccessMap.hasUserAccess) return null;

							const isActiveItem = navItem.route === currentRoute;
							return (
								<Stack
									className={`${styles.navItemContainer} ${isActiveItem && styles.navItemActive}`}
									gap={0}
									onClick={() => navigateToPage(navItem.route)}
									key={index}>
									<navItem.icon className={styles.navIcon} stroke={isActiveItem ? 1.8 : 1.4} size={'2rem'} />
									<Text className={styles.navItemLabel}>{navItem.label}</Text>
								</Stack>
							);
						})}
					</Stack>
					<Stack gap={0}>
						{navActions.map((navAction, index) => {
							const isActiveItem = false;
							const onClick =
								navAction.key === 'about'
									? toggleInfoModal
									: navAction.key === 'user'
									? toggleUserModal
									: navAction.key === 'logout'
									? signOutHandler
									: () => {};
							return (
								<Stack
									className={`${styles.navItemContainer} ${isActiveItem && styles.navItemActive}`}
									gap={0}
									onClick={onClick}
									style={{ border: 'none', padding: '8px 0px' }}
									key={index}>
									<navAction.icon className={styles.navIcon} stroke={isActiveItem ? 1.8 : 1.4} size={'2rem'} />
									<Text className={styles.navItemLabel}>{navAction.key === "user" ? username : navAction.label}</Text>
								</Stack>
							);
						})}
					</Stack>
					<InfoModal opened={infoModalOpened} close={toggleInfoModal} />
					<UserModal opened={userModalOpened} onClose={toggleUserModal} userData={getUserRolesData?.data || {}} />
				</div>
			</nav>
		</Box>
	);
};

export default Navbar;
