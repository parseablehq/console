import {
	NavLink,
	Select,
	Modal,
	Button,
	TextInput,
	Group,
	Box,
	rem,
	Stack,
	ActionIcon,
	ThemeIcon,
	Text,
} from '@mantine/core';
import {
	IconReportAnalytics,
	IconFileAlert,
	IconReload,
	IconLogout,
	IconUser,
	IconBinaryTree2,
	IconTableShortcut,
	IconSettings,
	IconTrash,
	IconInfoCircle,
	IconUserCog,
	IconTimelineEvent,
	IconHome,
} from '@tabler/icons-react';
import { FC, useCallback, useEffect, useState } from 'react';
import { useLocation, useParams, RouteMatch, matchRoutes } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import { useDisclosure } from '@mantine/hooks';
import { HOME_ROUTE, LOGS_ROUTE, USERS_MANAGEMENT_ROUTE } from '@/constants/routes';
import InfoModal from './infoModal';
import { getStreamsSepcificAccess, getUserSepcificStreams } from './rolesHandler';
import { LogStreamData } from '@/@types/parseable/api/stream';
import Cookies from 'js-cookie';
import { useUser } from '@/hooks/useUser';
import { useLogStream } from '@/hooks/useLogStream';
import { signOutHandler } from '@/utils';
import styles from './styles/Navbar.module.css';
import useCurrentRoute from '@/hooks/useCurrentRoute';
import { HEADER_HEIGHT, NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { heights } from '../Mantine/sizing';

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

const generateUserAcccessMap = (accessRoles: string[] | null) => {
	return ['hasUserAccess'].reduce((acc, accessRequirement) => {
		if (accessRequirement === 'hasUserAccess') {
			return { ...acc, [accessRequirement]: accessRoles?.some((access: string) => access === 'ListUser') || false };
		} else {
			return { ...acc, [accessRequirement]: false };
		}
	}, {});
};

const Navbar: FC = () => {
	const navigate = useNavigate();
	const { streamName } = useParams();
	const location = useLocation();
	const currentRoute = useCurrentRoute();

	const username = Cookies.get('username');

	const {
		state: { subAppContext, maximized, userSpecficStreams, userSpecificAccessMap },
		methods: { streamChangeCleanup, setUserRoles, setSelectedStream, setUserSpecficStreams, updateUserSpecificAccess },
	} = useHeaderContext();

	const selectedStream = subAppContext.get().selectedStream;
	const [currentPage, setCurrentPage] = useMountedState('/');
	const [deleteStream, setDeleteStream] = useMountedState('');

	const [opened, { open, close }] = useDisclosure(false);

	const { deleteLogStreamMutation, getLogStreamListData, getLogStreamListIsError, getLogStreamListRefetch } =
		useLogStream();

	const { getUserRolesData, getUserRolesMutation } = useUser();

	// useEffect(() => {
	// 	if (location.pathname.split('/')[2]) {
	// 		setCurrentPage(`/${location.pathname.split('/')[2]}`);
	// 	}
	// 	if (location.pathname === '/') {
	// 		setSelectedStream('');
	// 		setCurrentPage('/');
	// 		updateUserSpecificAccess(getStreamsSepcificAccess(getUserRolesData?.data));
	// 	} else if (userSpecficStreams && userSpecficStreams.length === 0) {
	// 		setSelectedStream('');
	// 		navigate('/');
	// 	} else if (streamName) {
	// 		if (streamName === deleteStream && userSpecficStreams) {
	// 			setDeleteStream('');
	// 			handleChange(userSpecficStreams[0].name);
	// 		} else if (userSpecficStreams && !userSpecficStreams.find((stream: any) => stream.name === streamName)) {
	// 			notifications.show({
	// 				id: 'getLogStreamListIsError-data',
	// 				color: 'red',
	// 				title: 'Error occurred',
	// 				message: `${streamName} stream not found`,
	// 				icon: <IconFileAlert size="1rem" />,
	// 				autoClose: 5000,
	// 			});
	// 			handleChange(userSpecficStreams[0].name);
	// 		} else if (userSpecficStreams?.find((stream: any) => stream.name === streamName)) {
	// 			handleChange(streamName);
	// 		}
	// 	} else if (userSpecficStreams && Boolean(userSpecficStreams.length)) {
	// 		if (location.pathname === USERS_MANAGEMENT_ROUTE) {
	// 			handleChangeWithoutRiderection(userSpecficStreams[0].name, location.pathname);
	// 			navigate('/users');
	// 		} else {
	// 			handleChange(userSpecficStreams[0].name);
	// 		}
	// 	}
	// }, [userSpecficStreams]);

	// const handleChange = (value: string, page: string = currentPage) => {
	// 	const targetPage = page === '/' ? '/logs' : page;
	// 	handleChangeWithoutRiderection(value, targetPage);
	// 	updateUserSpecificAccess(getStreamsSepcificAccess(getUserRolesData?.data, value));
	// 	if (page !== '/users') {
	// 		// navigate(`/${value}${targetPage}`);
	// 	}
	// };

	// const handleChangeWithoutRiderection = (value: string, page: string = currentPage) => {
	// 	setSelectedStream(value);
	// 	setCurrentPage(page);
	// 	streamChangeCleanup(value);
	// };

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
						{/* <NavLink
							label="Log Streams"
							leftSection={<IconBinaryTree2 size="1.5rem" stroke={1.3} />}
							className={styles.streamsBtn}
						/> */}
						{/* <Select
							placeholder="Pick one"
							onChange={(value) => {
								const targetValue = value === null ? selectedStream : value;
								handleChange(targetValue || '');
							}}
							nothingFoundMessage="No options"
							value={selectedStream}
							data={userSepecficStreams?.map((stream: any) => ({ value: stream.name, label: stream.name })) ?? []}
							searchable
							required
							className={styles.selectStreambtn}
							classNames={{ option: styles.option }}
						/> */}

						{/* {getLogStreamListIsError && <div>{getLogStreamListIsError}</div>}
						{getLogStreamListIsError && (
							<NavLink
								label="Retry"
								leftSection={<IconReload size="1rem" stroke={1.5} />}
								component="button"
								onClick={() => getLogStreamListRefetch()}
								style={{ paddingLeft: 0 }}
							/>
						)} */}
						{/* {links.map((link) => {
							if (
								(link.requiredAccess &&
									!userSepecficAccess?.some((access: string) => link.requiredAccess.includes(access))) ||
								selectedStream === ''
							) {
								return null;
							}
							return (
								<NavLink
									label={link.label}
									leftSection={<link.icon size="1.3rem" stroke={1.2} />}
									disabled={disableLink}
									onClick={() => {
										handleChange(selectedStream, link.pathname);
									}}
									style={{ paddingLeft: 20, paddingRight: 20 }}
									key={link.label}
									className={(currentPage === link.pathname && styles.linkBtnActive) || styles.linkBtn}
								/>
							);
						})} */}
						{/* {!userSepecficAccess?.some((access: string) => ['DeleteStream'].includes(access)) ||
						selectedStream === '' ? null : (
							<NavLink
								label={'Delete'}
								leftSection={<IconTrash size="1.3rem" stroke={1.2} />}
								onClick={openDelete}
								style={{ paddingLeft: 20, paddingRight: 20 }}
								disabled={disableLink}
							/>
						)} */}
						{/* {!userSepecficAccess?.some((access: string) => ['ListUser'].includes(access)) ? null : (
							<NavLink
								className={
									(currentPage === USERS_MANAGEMENT_ROUTE && styles.userManagementBtnActive) || styles.userManagementBtn
								}
								label="Users"
								leftSection={<IconUserCog size="1.5rem" stroke={1.3} />}
								onClick={() => {
									navigate('/users');
									setCurrentPage(USERS_MANAGEMENT_ROUTE);
								}}
							/>
						)} */}
					</Stack>
					{/* <Group className={styles.lowerContainer} gap={0}>
						<NavLink
							label={username}
							leftSection={<IconUser size="1.3rem" stroke={1.3} />}
							className={styles.userBtn}
							component="a"
						/>
						<NavLink
							label="About"
							leftSection={<IconInfoCircle size="1.3rem" stroke={1.3} />}
							className={styles.actionBtn}
							component="a"
							onClick={open}
						/>
						<NavLink
							label="Log out"
							leftSection={<IconLogout size="1.3rem" stroke={1.3} />}
							className={styles.actionBtn}
							component="a"
							onClick={signOutHandler}
						/>
					</Group> */}
					<InfoModal opened={opened} close={close} />
				</div>
			</nav>
		</Box>
	);
};

export default Navbar;
