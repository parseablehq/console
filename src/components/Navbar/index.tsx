import type { NavbarProps as MantineNavbarProps } from '@mantine/core';
import { Navbar as MantineNavbar, NavLink, Select, Modal, Button, TextInput, Group } from '@mantine/core';
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
} from '@tabler/icons-react';
import { FC, useEffect } from 'react';
import { useNavbarStyles } from './styles';
import { useLocation, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import { useDisclosure } from '@mantine/hooks';
import { USERS_MANAGEMENT_ROUTE } from '@/constants/routes';
import InfoModal from './infoModal';
import { getStreamsSepcificAccess, getUserSepcificStreams } from './rolesHandler';
import { LogStreamData } from '@/@types/parseable/api/stream';
import Cookies from 'js-cookie';
import { NAVBAR_WIDTH } from '@/constants/theme';
import { useUser } from '@/hooks/useUser';
import { useLogStream } from '@/hooks/useLogStream';
import { signOutHandler } from '@/utils';

const isSecureConnection = window.location.protocol === 'https:';
const links = [
	{ icon: IconTableShortcut, label: 'Explore', pathname: '/logs', requiredAccess: ['Query', 'GetSchema'] },
	...(!isSecureConnection
		? [{ icon: IconTimelineEvent, label: 'Live tail', pathname: '/live-tail', requiredAccess: ['GetLiveTail'] }]
		: []),
	{ icon: IconReportAnalytics, label: 'Stats', pathname: '/stats', requiredAccess: ['GetStats'] },
	{ icon: IconSettings, label: 'Config', pathname: '/config', requiredAccess: ['PutAlert'] },
];

type NavbarProps = Omit<MantineNavbarProps, 'children'>;

const Navbar: FC<NavbarProps> = (props) => {
	const navigate = useNavigate();
	const { streamName } = useParams();
	const location = useLocation();

	const username = Cookies.get('username');

	const {
		state: { subNavbarTogle, subAppContext },
		methods: { streamChangeCleanup, setUserRoles, setSelectedStream },
	} = useHeaderContext();

	const selectedStream = subAppContext.get().selectedStream;
	const [searchValue, setSearchValue] = useMountedState('');
	const [currentPage, setCurrentPage] = useMountedState('/');
	const [deleteStream, setDeleteStream] = useMountedState('');
	const [userSepecficStreams, setUserSepecficStreams] = useMountedState<LogStreamData | null>(null);
	const [userSepecficAccess, setUserSepecficAccess] = useMountedState<string[] | null>(null);

	const [disableLink, setDisableLink] = useMountedState(false);
	const [isSubNavbarOpen, setIsSubNavbarOpen] = useMountedState(false);
	const [opened, { open, close }] = useDisclosure(false);
	const [openedDelete, { close: closeDelete, open: openDelete }] = useDisclosure();

	const { deleteLogStreamMutation, getLogStreamListData, getLogStreamListIsError, getLogStreamListRefetch } =
		useLogStream();

	const { getUserRolesData, getUserRolesMutation } = useUser();

	useEffect(() => {
		const listener = subNavbarTogle.subscribe(setIsSubNavbarOpen);
		return () => {
			listener();
		};
	}, [subNavbarTogle.get()]);

	useEffect(() => {
		if (location.pathname.split('/')[2]) {
			setCurrentPage(`/${location.pathname.split('/')[2]}`);
		}
		if (location.pathname === '/') {
			setSelectedStream('');
			setCurrentPage('/');
			setUserSepecficAccess(getStreamsSepcificAccess(getUserRolesData?.data));
		} else if (userSepecficStreams && userSepecficStreams.length === 0) {
			setSelectedStream('');
			setSearchValue('');
			setDisableLink(true);
			navigate('/');
		} else if (streamName) {
			if (streamName === deleteStream && userSepecficStreams) {
				setDeleteStream('');
				handleChange(userSepecficStreams[0].name);
			} else if (userSepecficStreams && !userSepecficStreams.find((stream: any) => stream.name === streamName)) {
				notifications.show({
					id: 'getLogStreamListIsError-data',
					color: 'red',
					title: 'Error occurred',
					message: `${streamName} stream not found`,
					icon: <IconFileAlert size="1rem" />,
					autoClose: 5000,
				});
				handleChange(userSepecficStreams[0].name);
			} else if (userSepecficStreams?.find((stream: any) => stream.name === streamName)) {
				handleChange(streamName);
			}
		} else if (userSepecficStreams && Boolean(userSepecficStreams.length)) {
			if (location.pathname === USERS_MANAGEMENT_ROUTE) {
				handleChangeWithoutRiderection(userSepecficStreams[0].name, location.pathname);
				navigate('/users');
			} else {
				handleChange(userSepecficStreams[0].name);
			}
		}
	}, [userSepecficStreams]);

	const handleChange = (value: string, page: string = currentPage) => {
		const targetPage = page === '/' ? '/logs' : page;
		handleChangeWithoutRiderection(value, targetPage);
		setUserSepecficAccess(getStreamsSepcificAccess(getUserRolesData?.data, value));
		if (page !== '/users') {
			navigate(`/${value}${targetPage}`);
		}
	};

	const handleChangeWithoutRiderection = (value: string, page: string = currentPage) => {
		setSelectedStream(value);
		setSearchValue(value);
		setCurrentPage(page);
		streamChangeCleanup(value);
		setDisableLink(false);
	};
	const handleCloseDelete = () => {
		closeDelete();
		setDeleteStream('');
	};

	const handleDelete = () => {
		deleteLogStreamMutation({ deleteStream });
		closeDelete();
	};

	useEffect(() => {
		if (getLogStreamListData?.data && getLogStreamListData?.data.length > 0 && getUserRolesData?.data) {
			getUserRolesData?.data && setUserRoles(getUserRolesData?.data); // TODO: move user context main context
			const userStreams = getUserSepcificStreams(getUserRolesData?.data, getLogStreamListData?.data as any);
			setUserSepecficStreams(userStreams as any);
		} else {
			setUserSepecficStreams([]);
			setUserSepecficAccess(getStreamsSepcificAccess(getUserRolesData?.data));
		}
	}, [getUserRolesData?.data, getLogStreamListData?.data]);

	useEffect(() => {
		getUserRolesMutation({ userName: username ? username : '' });
	}, [username]);

	const { classes } = useNavbarStyles();
	const {
		container,
		linkBtnActive,
		linkBtn,
		selectStreambtn,
		streamsBtn,
		lowerContainer,
		actionBtn,
		userBtn,
		userManagementBtn,
		userManagementBtnActive,
		modalStyle,
		modalActionBtn,
		modalCancelBtn,
	} = classes;
	return (
		<MantineNavbar
			{...props}
			withBorder
			zIndex={1}
			hiddenBreakpoint={window.outerWidth + 20}
			hidden={isSubNavbarOpen}
			width={{ xs: `${NAVBAR_WIDTH}px` }}>
			<MantineNavbar.Section grow className={container}>
				<NavLink label="Log Streams" icon={<IconBinaryTree2 size="1.5rem" stroke={1.3} />} className={streamsBtn} />
				<Select
					placeholder="Pick one"
					onChange={(value) => handleChange(value || '')}
					nothingFound="No options"
					value={selectedStream}
					searchValue={searchValue}
					onSearchChange={(value) => setSearchValue(value)}
					onDropdownClose={() => setSearchValue(selectedStream)}
					onDropdownOpen={() => setSearchValue('')}
					data={userSepecficStreams?.map((stream: any) => ({ value: stream.name, label: stream.name })) ?? []}
					searchable
					required
					className={selectStreambtn}
				/>
				{getLogStreamListIsError && <div>{getLogStreamListIsError}</div>}
				{getLogStreamListIsError && (
					<NavLink
						label="Retry"
						icon={<IconReload size="1rem" stroke={1.5} />}
						component="button"
						onClick={() => getLogStreamListRefetch()}
						sx={{ paddingLeft: 0 }}
					/>
				)}
				{links.map((link) => {
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
							icon={<link.icon size="1.3rem" stroke={1.2} />}
							sx={{ paddingLeft: 53 }}
							disabled={disableLink}
							onClick={() => {
								handleChange(selectedStream, link.pathname);
							}}
							key={link.label}
							className={(currentPage === link.pathname && linkBtnActive) || linkBtn}
						/>
					);
				})}
				{!userSepecficAccess?.some((access: string) => ['DeleteStream'].includes(access)) ||
				selectedStream === '' ? null : (
					<NavLink
						label={'Delete'}
						icon={<IconTrash size="1.3rem" stroke={1.2} />}
						sx={{ paddingLeft: 53 }}
						onClick={openDelete}
						className={linkBtn}
						disabled={disableLink}
					/>
				)}

				{!userSepecficAccess?.some((access: string) => ['ListUser'].includes(access)) ? null : (
					<NavLink
						pt={24}
						className={(currentPage === USERS_MANAGEMENT_ROUTE && userManagementBtnActive) || userManagementBtn}
						label="Users"
						icon={<IconUserCog size="1.5rem" stroke={1.3} />}
						onClick={() => {
							navigate('/users');
							setCurrentPage(USERS_MANAGEMENT_ROUTE);
						}}
					/>
				)}
			</MantineNavbar.Section>
			<MantineNavbar.Section className={lowerContainer}>
				<NavLink label={username} icon={<IconUser size="1.3rem" stroke={1.3} />} className={userBtn} component="a" />
				<NavLink
					label="About"
					icon={<IconInfoCircle size="1.3rem" stroke={1.3} />}
					className={actionBtn}
					component="a"
					onClick={open}
				/>
				<NavLink
					label="Log out"
					icon={<IconLogout size="1.3rem" stroke={1.3} />}
					className={actionBtn}
					component="a"
					onClick={signOutHandler}
				/>
			</MantineNavbar.Section>
			<Modal
				withinPortal
				size="md"
				opened={openedDelete}
				onClose={handleCloseDelete}
				title={'Delete Stream'}
				centered
				className={modalStyle}>
				<TextInput
					type="text"
					label="Are you sure you want to delete this stream?"
					onChange={(e) => {
						setDeleteStream(e.target.value);
					}}
					placeholder={`Type the name of the stream to confirm. i.e. ${selectedStream}`}
					required
				/>

				<Group mt={10} position="right">
					<Button
						className={modalActionBtn}
						disabled={deleteStream === selectedStream ? false : true}
						onClick={handleDelete}>
						Delete
					</Button>
					<Button onClick={handleCloseDelete} className={modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
			<InfoModal opened={opened} close={close} />
		</MantineNavbar>
	);
};

export default Navbar;
