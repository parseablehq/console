import type { NavbarProps as MantineNavbarProps } from '@mantine/core';
import { Navbar as MantineNavbar, NavLink, Select, Box, Modal, Text, Button, TextInput } from '@mantine/core';
import {
	IconZoomCode,
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
} from '@tabler/icons-react';
import { FC, useEffect } from 'react';
import { useNavbarStyles } from './styles';
import { useLocation, useParams } from 'react-router-dom';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_FIXED_DURATIONS, useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import dayjs from 'dayjs';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { LOGIN_ROUTE, USERS_MANAGEMENT_ROUTE } from '@/constants/routes';
import { useDeleteLogStream } from '@/hooks/useDeleteLogStream';
import InfoModal from './infoModal';
import { useGetUserRole } from '@/hooks/useGetUserRoles';
import {  getStreamsSepcificAccess, getUserSepcificStreams } from './rolesHandler';
import { LogStreamData } from '@/@types/parseable/api/stream';

const links = [
	{ icon: IconZoomCode, label: 'Query', pathname: '/query', requiredAccess: ["Query","GetSchema"] },
	{ icon: IconTableShortcut, label: 'Logs', pathname: '/logs', requiredAccess: ["Query","GetSchema"]},
	{ icon: IconReportAnalytics, label: 'Stats', pathname: '/stats', requiredAccess: ["GetStats"]},
	{ icon: IconSettings, label: 'Config', pathname: '/config', requiredAccess: ["PutAlert"]},
];

type NavbarProps = Omit<MantineNavbarProps, 'children'>;

const Navbar: FC<NavbarProps> = (props) => {
	const navigate = useNavigate();
	const { streamName } = useParams();
	const location = useLocation();

	const [username] = useLocalStorage({ key: 'username', getInitialValueInEffect: false });
	const [, , removeCredentials] = useLocalStorage({ key: 'credentials' });
	const [, , removeUsername] = useLocalStorage({ key: 'username' });

	const {
		state: { subNavbarTogle },
	} = useHeaderContext();

	const [activeStream, setActiveStream] = useMountedState('');
	const [searchValue, setSearchValue] = useMountedState('');
	const [currentPage, setCurrentPage] = useMountedState('/query');
	const [deleteStream, setDeleteStream] = useMountedState('');
	const [userSepecficStreams, setUserSepecficStreams] =useMountedState<LogStreamData | null>(null );
	const [userSepecficAccess, setUserSepecficAccess] =useMountedState<string[] | null>(null);

	const [disableLink, setDisableLink] = useMountedState(false);
	const [isSubNavbarOpen, setIsSubNavbarOpen] = useMountedState(false);
	const [opened, { open, close }] = useDisclosure(false);
	const [openedDelete, { close: closeDelete, open: openDelete }] = useDisclosure();

	const { data: streams, error, getData, resetData: resetStreamArray } = useGetLogStreamList();
	const { data: deleteData, deleteLogStreamFun } = useDeleteLogStream();
	useEffect(() => {
		const listener = subNavbarTogle.subscribe(setIsSubNavbarOpen);
		return () => {
			listener();
		};
	}, [subNavbarTogle.get()]);

	const onSignOut = () => {
		removeCredentials();
		removeUsername();
		navigate(
			{
				pathname: LOGIN_ROUTE,
			},
			{ replace: true },
		);
	};

	const {
		state: { subLogQuery, subLogSelectedTimeRange, subLogSearch, subRefreshInterval },
	} = useHeaderContext();

	useEffect(() => {
		if (location.pathname.split('/')[2]) {
			setCurrentPage(`/${location.pathname.split('/')[2]}`);
		}
		if (userSepecficStreams && userSepecficStreams.length === 0) {
			setActiveStream('');
			setSearchValue('');
			setDisableLink(true);
			navigate(`/`);
		} else if (streamName) {
			if (streamName === deleteStream && userSepecficStreams) {
				setDeleteStream('');
				handleChange(userSepecficStreams[0].name);
			} else if (userSepecficStreams && !userSepecficStreams.find((stream : any) => stream.name === streamName)) {
				notifications.show({
					id: 'error-data',
					color: 'red',
					title: 'Error Occured',
					message: `${streamName} stream not found`,
					icon: <IconFileAlert size="1rem" />,
					autoClose: 5000,
				});
				handleChange(userSepecficStreams[0].name);
			} else if (userSepecficStreams?.find((stream:any) => stream.name === streamName)) {
				handleChange(streamName);
			}
		} else if (userSepecficStreams && Boolean(userSepecficStreams.length)) {
			if (location.pathname === USERS_MANAGEMENT_ROUTE) {
				handleChangeWithoutRiderection(userSepecficStreams[0].name, location.pathname);
				navigate(`/users`);
			} else {
				handleChange(userSepecficStreams[0].name);
			}
		}
	}, [userSepecficStreams]);

	const handleChange = (value: string,page: string = currentPage ) => {
		handleChangeWithoutRiderection(value,page);
		navigate(`/${value}${page}`);
	};
	const handleChangeWithoutRiderection = (value: string, page: string = currentPage) => {
		setActiveStream(value);
		setSearchValue(value);
		setCurrentPage(page);
		const now = dayjs();
		setUserSepecficAccess(getStreamsSepcificAccess(roles, value));
		subLogQuery.set((state) => {
			state.streamName = value || '';
			state.startTime = now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate();
			state.endTime = now.toDate();
			state.access= getStreamsSepcificAccess(roles, value);
		});
		subLogSelectedTimeRange.set((state) => {
			state.state = 'fixed';
			state.value = DEFAULT_FIXED_DURATIONS.name;
		});
		subLogSearch.set((state) => {
			state.search = '';
			state.filters = {};
		});
		subRefreshInterval.set(null);
		setDisableLink(false);
	};
	const handleCloseDelete = () => {
		closeDelete();
		setDeleteStream('');
	};

	const handleDelete = () => {
		deleteLogStreamFun(deleteStream);
		closeDelete();
	};

	useEffect(() => {
		if (deleteData) {
			resetStreamArray();
			getData();
			return;
		}
	}, [deleteData]);

	//isAdmin
	const { data: roles, getRoles, resetData } = useGetUserRole();
	useEffect(() => {
		if (username) {
			getRoles(username);
		}
		return () => {
			resetData();
		};
	}, [username]);

	useEffect(() => {
		if(streams && streams.length > 0 && roles && roles.length > 0){
			const userStreams = getUserSepcificStreams(roles,streams as any);
			setUserSepecficStreams(userStreams as any); 
		}

	}, [roles, streams]);


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
	} = classes;
	return (
		<MantineNavbar {...props} withBorder zIndex={1} hiddenBreakpoint={window.outerWidth + 20} hidden={isSubNavbarOpen}>
			<MantineNavbar.Section grow className={container}>
				
				<NavLink label="Log Streams" icon={<IconBinaryTree2 size="1.5rem" stroke={1.3} />} className={streamsBtn} />
				<Select
					placeholder="Pick one"
					onChange={(value) => handleChange(value || '')}
					nothingFound="No options"
					value={activeStream}
					searchValue={searchValue}
					onSearchChange={(value) => setSearchValue(value)}
					onDropdownClose={() => setSearchValue(activeStream)}
					onDropdownOpen={() => setSearchValue('')}
					data={userSepecficStreams?.map((stream:any) => ({ value: stream.name, label: stream.name })) ?? []}
					searchable
					required
					className={selectStreambtn}
				/>
				{links.map((link) => {
					if (link.requiredAccess && !userSepecficAccess?.some((access:string) => link.requiredAccess.includes(access))) {
						return null;
					}
					return (
						<NavLink
							label={link.label}
							icon={<link.icon size="1.3rem" stroke={1.2} />}
							sx={{ paddingLeft: 53 }}
							disabled={disableLink}
							onClick={() => {
								handleChange(activeStream,link.pathname);
							}}
							key={link.label}
							className={(currentPage === link.pathname && linkBtnActive) || linkBtn}
						/>
					);
				})}
				{ !userSepecficAccess?.some((access:string) => ["DeleteStream"].includes(access)) ? null :
				 <NavLink
					label={'Delete'}
					icon={<IconTrash size="1.3rem" stroke={1.2} />}
					sx={{ paddingLeft: 53 }}
					onClick={openDelete}
					className={linkBtn}
					disabled={disableLink}
				/>
				}
				
				{error && <div>{error}</div>}
				{error && (
					<NavLink
						label="Retry"
						icon={<IconReload size="1rem" stroke={1.5} />}
						component="button"
						onClick={getData}
						sx={{ paddingLeft: 0 }}
					/>
				)}
				{ !userSepecficAccess?.some((access:string) => ["ListUser"].includes(access)) ? null :
					<NavLink
						pt={24}
						className={(currentPage === USERS_MANAGEMENT_ROUTE && userManagementBtnActive) || userManagementBtn}
						label="Users"
						icon={<IconUserCog size="1.5rem" stroke={1.3} />}
						onClick={() => {
							navigate(`/users`);
							setCurrentPage(USERS_MANAGEMENT_ROUTE);
						}}
					/>
				}
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
					onClick={onSignOut}
				/>
			</MantineNavbar.Section>
			<Modal withinPortal size="md" opened={openedDelete} onClose={handleCloseDelete} title={'Delete Stream'} centered>
				<Text>Are you sure you want to delete this stream?</Text>
				<TextInput
					type="text"
					onChange={(e) => {
						setDeleteStream(e.target.value);
					}}
					placeholder={`Type the name of the stream to confirm. i.e: ${activeStream}`}
				/>

				<Box mt={10} display="flex" sx={{ justifyContent: 'end' }}>
					<Button
						variant="filled"
						color="red"
						sx={{ margin: '12px' }}
						disabled={deleteStream === activeStream ? false : true}
						onClick={handleDelete}>
						Delete
					</Button>
					<Button onClick={handleCloseDelete} variant="filled" color="green" sx={{ margin: '12px' }}>
						Cancel
					</Button>
				</Box>
			</Modal>
			<InfoModal opened={opened} close={close} />
		</MantineNavbar>
	);
};

export default Navbar;
