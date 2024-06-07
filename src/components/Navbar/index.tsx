import { Box, Divider, Stack, Tooltip } from '@mantine/core';
import {
	IconLogout,
	IconUser,
	IconInfoCircle,
	IconUserCog,
	IconServerCog,
	IconHomeStats,
	IconListDetails,
} from '@tabler/icons-react';
import { FC, useCallback, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { HOME_ROUTE, CLUSTER_ROUTE, USERS_MANAGEMENT_ROUTE, STREAM_ROUTE } from '@/constants/routes';
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
		icon: IconHomeStats,
		label: 'Home',
		path: '/',
		route: HOME_ROUTE,
	},
	{
		icon: IconListDetails,
		label: 'Stream',
		path: '/explore',
		route: STREAM_ROUTE,
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
	},
];

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
	const { streamName, view } = useParams();
	const location = useLocation();
	const currentRoute = useCurrentRoute();
	const username = Cookies.get('username');
	const [maximized, setAppStore] = useAppStore((store) => store.maximized);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const [userAccessMap] = useAppStore((store) => store.userAccessMap);
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	const [userModalOpened, { toggle: toggleUserModal, close: closeUserModal }] = useDisclosure(false);
	const [infoModalOpened, { toggle: toggleInfoModal, close: closeInfoModal }] = useDisclosure(false);
	const { getLogStreamListData } = useLogStream();
	const { getUserRolesData, getUserRolesMutation } = useUser();
	const navigateToPage = useCallback(
		(route: string) => {
			if (route === STREAM_ROUTE) {
				if (_.isEmpty(userSpecificStreams) || _.isNil(userSpecificStreams)) return navigate('/');

				const defaultStream = currentStream && currentStream.length !== 0 ? currentStream : userSpecificStreams[0].name;
				const stream = !streamName || streamName.length === 0 ? defaultStream : streamName;
				const path = `/${stream}${view ? '/' + view : '/explore'}`;
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
		if (getUserRolesData?.data) {
			getUserRolesData?.data && setAppStore((store) => setUserRoles(store, getUserRolesData?.data)); // TODO: move user context main context
			if (getLogStreamListData?.data && getLogStreamListData?.data.length > 0) {
				const userStreams = getUserSepcificStreams(getUserRolesData?.data, getLogStreamListData?.data as any);
				setAppStore((store) => setUserSpecificStreams(store, userStreams));
			} else {
				setAppStore((store) => setUserSpecificStreams(store, null));
			}
		}
		setAppStore((store) => setUserAccessMap(store, getStreamsSepcificAccess(getUserRolesData?.data)));
	}, [getUserRolesData?.data, getLogStreamListData?.data]);

	useEffect(() => {
		getUserRolesMutation({ userName: username ? username : '' });
	}, [username]);

	useEffect(() => {
		if (streamName && streamName.length !== 0 && userSpecificStreams && userSpecificStreams.length !== 0) {
			const hasAccessToStream = userSpecificStreams.find((stream: any) => stream.name === streamName);
			return hasAccessToStream ? navigateToPage(STREAM_ROUTE) : navigateToPage('/');
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
										<navItem.icon stroke={isActiveItem ? 1 : 1} size={'1.5rem'} />
									</Tooltip>
								</Stack>
							);
						})}
					</Stack>
					<Stack gap={0}>
						{previlagedActions.map((navItem, index) => {
							if (isStandAloneMode === null) return null;
							if (navItem.route === USERS_MANAGEMENT_ROUTE && !userAccessMap.hasUserAccess) return null;
							if (navItem.route === CLUSTER_ROUTE && (!userAccessMap.hasUserAccess || isStandAloneMode)) return null;

							const isActiveItem = navItem.route === currentRoute;
							return (
								<Stack
									className={`${styles.navItemContainer} ${isActiveItem && styles.navItemActive}`}
									gap={0}
									onClick={() => navigateToPage(navItem.route)}
									key={index}>
									<Tooltip label={navItem.label} position="right">
										<navItem.icon className={styles.navIcon} stroke={isActiveItem ? 1 : 1} size={'1.5rem'} />
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
									style={{ padding: '8px 0px' }}
									key={index}>
									<Tooltip label={navAction.label} position="right">
										<navAction.icon className={styles.navIcon} stroke={1} size={'1.5rem'} />
									</Tooltip>
								</Stack>
							);
						})}
					</Stack>
					<InfoModal opened={infoModalOpened} close={closeInfoModal} />
					<UserModal opened={userModalOpened} onClose={closeUserModal} userData={getUserRolesData?.data || {}} />
				</div>
			</nav>
		</Box>
	);
};

export default Navbar;
