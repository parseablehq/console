import { Box, Divider, Stack, Tooltip } from '@mantine/core';
import { IconLogout, IconUser, IconBinaryTree2, IconInfoCircle, IconUserCog, IconHome, IconServerCog } from '@tabler/icons-react';
import { FC, useCallback, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { HOME_ROUTE, LOGS_ROUTE, CLUSTER_ROUTE, USERS_MANAGEMENT_ROUTE } from '@/constants/routes';
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
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';

const { setUserRoles, setUserSpecificStreams, setUserAccessMap, changeStream } = appStoreReducers;

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
];

const previlagedActions = [
	{
		icon: IconUserCog,
		label: 'Users',
		path: '/users',
		route: USERS_MANAGEMENT_ROUTE,
	},
	{
		icon: IconServerCog,
		label: 'Cluster',
		path: '/cluster',
		route: CLUSTER_ROUTE,
	}
]

const navActions = [
	{
		icon: IconUser,
		label: 'Profile',
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
	const [maximized, setAppStore] = useAppStore((store) => store.maximized);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const [userAccessMap] = useAppStore((store) => store.userAccessMap);
	const [userModalOpened, { toggle: toggleUserModal }] = useDisclosure(false);
	const [infoModalOpened, { toggle: toggleInfoModal }] = useDisclosure(false);
	const { getLogStreamListData } = useLogStream();
	const { getUserRolesData, getUserRolesMutation } = useUser();
	const navigateToPage = useCallback(
		(route: string) => {
			if (route === LOGS_ROUTE) {
				if (_.isEmpty(userSpecificStreams) || _.isNil(userSpecificStreams)) return navigate('/');

				const defaultStream = currentStream && currentStream.length !== 0 ? currentStream : userSpecificStreams[0].name;
				const stream = !streamName || streamName.length === 0 ? defaultStream : streamName;
				const path = `/${stream}/logs`;
				setAppStore((store) => changeStream(store, stream));

				if (path !== location.pathname) {
					navigate(path);
				}
			} else {
				return navigate(route);
			}
		},
		[userSpecificStreams, streamName],
	);

	useEffect(() => {
		if (getLogStreamListData?.data && getLogStreamListData?.data.length > 0 && getUserRolesData?.data) {
			getUserRolesData?.data && setAppStore((store) => setUserRoles(store, getUserRolesData?.data)); // TODO: move user context main context
			const userStreams = getUserSepcificStreams(getUserRolesData?.data, getLogStreamListData?.data as any);
			setAppStore((store) => setUserSpecificStreams(store, userStreams));
		} else {
			setAppStore((store) => setUserSpecificStreams(store, null));
		}
		setAppStore((store) => setUserAccessMap(store, getStreamsSepcificAccess(getUserRolesData?.data)));
	}, [getUserRolesData?.data, getLogStreamListData?.data]);

	useEffect(() => {
		getUserRolesMutation({ userName: username ? username : '' });
	}, [username]);

	useEffect(() => {
		if (streamName && streamName.length !== 0 && userSpecificStreams && userSpecificStreams.length !== 0) {
			const hasAccessToStream = userSpecificStreams.find((stream: any) => stream.name === streamName);
			return hasAccessToStream ? navigateToPage(LOGS_ROUTE) : navigateToPage('/');
		}
	}, [streamName, userSpecificStreams]);

	if (maximized) return null;

	return (
		<Box>
			<nav
				className={styles.navbar}
				style={{ width: NAVBAR_WIDTH, height: `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px)`, position: 'relative' }}>
				<div className={styles.navbarMain}>
					<Stack justify="center" align="center" gap={0}>
						{navItems.map((navItem, index) => {
							const isActiveItem = navItem.route === currentRoute;
							return (
								<Stack
									className={`${styles.navItemContainer} ${isActiveItem && styles.navItemActive}`}
									gap={0}
									onClick={() => navigateToPage(navItem.route)}
									key={index}>
									<Tooltip label={navItem.label} position="right">
										<navItem.icon className={styles.navIcon} stroke={isActiveItem ? 1.2 : 1} size={'1.8rem'} />
									</Tooltip>
								</Stack>
							);
						})}
					</Stack>
					<Stack gap={4}>
						{previlagedActions.map((navItem, index) => {
							if (navItem.route === USERS_MANAGEMENT_ROUTE && !userAccessMap.hasUserAccess) return null;
							if (navItem.route === CLUSTER_ROUTE && !userAccessMap.hasUserAccess) return null;

							const isActiveItem = navItem.route === currentRoute;
							return (
								<Stack
									className={`${styles.navItemContainer} ${isActiveItem && styles.navItemActive}`}
									gap={0}
									onClick={() => navigateToPage(navItem.route)}
									key={index}>
									<Tooltip label={navItem.label} position="right">
										<navItem.icon className={styles.navIcon} stroke={isActiveItem ? 1.2 : 1} size={'1.8rem'} />
									</Tooltip>
								</Stack>
							);
						})}
						<Divider />
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
									<Tooltip label={navAction.label} position="right">
										<navAction.icon className={styles.navIcon} stroke={1.2} size={'1.8rem'} />
									</Tooltip>
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
