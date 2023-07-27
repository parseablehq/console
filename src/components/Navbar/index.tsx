import type { NavbarProps as MantineNavbarProps } from '@mantine/core';
import { Navbar as MantineNavbar, NavLink, Select, Anchor, Card, Box, Modal, Text, Image, Button, TextInput } from '@mantine/core';
import {
	IconZoomCode,
	IconReportAnalytics,
	IconCheck,
	IconFileAlert,
	IconReload,
	IconHelpCircle,
	IconLogout,
	IconUser,
	IconBinaryTree2,
	IconTableShortcut,
	IconSettings,
	IconTrash,
} from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import docImage from '@/assets/images/doc.webp';
import githubLogo from '@/assets/images/github-logo.webp';
import slackLogo from '@/assets/images/slack-logo.webp';
import { useNavbarStyles } from './styles';
import { useLocation, useParams } from 'react-router-dom';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_FIXED_DURATIONS, useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import dayjs from 'dayjs';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { LOGIN_ROUTE } from '@/constants/routes';
import { useDeleteLogStream } from '@/hooks/useDeleteLogStream';

const links = [
	{ icon: IconZoomCode, label: 'Query', pathname: '/query' },
	{ icon: IconTableShortcut, label: 'Logs', pathname: '/logs' },
	{ icon: IconReportAnalytics, label: 'Stats', pathname: '/stats' },
	{ icon: IconSettings, label: 'Config', pathname: '/config' },
];

type NavbarProps = Omit<MantineNavbarProps, 'children'>;

const Navbar: FC<NavbarProps> = (props) => {
	const [username] = useLocalStorage({ key: 'username', getInitialValueInEffect: false });
	const navigate = useNavigate();
	const { data: streams, loading, error, getData, resetData:resetStreamArray} = useGetLogStreamList();
	const [activeStream, setActiveStream] = useState('');
	const [searchValue, setSearchValue] = useState('');
	const { classes } = useNavbarStyles();
	const [currentPage, setCurrentPage] = useState('/logs');
	const [opened, { open, close }] = useDisclosure(false);
	const [ deleteStream, setDeleteStream] = useState('');
	const [disableLink, setDisableLink] = useState(false);
	const {
		container,
		linkBtnActive,
		linkBtn,
		selectStreambtn,
		streamsBtn,
		lowerContainer,
		actionBtn,
		helpTitle,
		helpDescription,
		userBtn,
	} = classes;
	const { streamName } = useParams();
	const nav = useNavigate();
	const [, , removeCredentials] = useLocalStorage({ key: 'credentials' });
	const [, , removeUsername] = useLocalStorage({ key: 'username' });
	const {
		state: { subNavbarTogle },
	} = useHeaderContext();
	const [isSubNavbarOpen, setIsSubNavbarOpen] = useMountedState(false);
	const [openedDelete, { close:closeDelete, open:openDelete}] = useDisclosure();
	let location = useLocation();
	const {data:deleteData, loading:deleteLoading, error:deleteError, deleteLogStreamFun , resetData: resetDeleteStraeam} = useDeleteLogStream();

	useEffect(() => {
		const listener = subNavbarTogle.subscribe(setIsSubNavbarOpen);
		return () => {
			listener();
		};
	}, [subNavbarTogle.get()]);

	const onSignOut = () => {
		removeCredentials();
		removeUsername();
		nav(
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
		if(streams && streams.length!==0 && !streams.find((stream)=>stream.name===streamName)&& streamName && streamName===deleteStream){
			
			navigate(`/${streams[0].name}/query`);
			return;
		}
		else if(streamName&&streams && streams.length!==0 && !streams.find((stream)=>stream.name===streamName) ){
			notifications.show({
				id: 'error-data',
				color: 'red',
				title: 'Error Occured',
				message: `${streamName} stream not found`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 5000,
			});
			
			navigate(`/${streams[0].name}/query`);
			return;
		}
		else if (streamName && streams?.length!==0 && streams?.find((stream)=>stream.name===streamName)) {
			setActiveStream(streamName);
			setSearchValue(streamName);
				const now = dayjs();
				subLogQuery.set((state) => {
					state.streamName = streamName || '';
					state.startTime = now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate();
					state.endTime = now.toDate();
				});
				subLogSelectedTimeRange.set(DEFAULT_FIXED_DURATIONS.name);
				subLogSearch.set((state) => {
					state.search = '';
					state.filters = {};
				});
				subRefreshInterval.set(null);
		} else if (streams && Boolean(streams.length)) {
			navigate(`/${streams[0].name}/query`);
		}
	}, [streams, location]);

	const handleChange = (value: string) => {
		setActiveStream(value);
		setSearchValue(value);
		navigate(`/${value}${currentPage}`);
	};

	useEffect(() => {
		if (loading) {
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Fetching Streams',
				message: 'Streams will be loaded.',
				autoClose: false,
				withCloseButton: false,
			});
		}
		if (streams && Boolean(streams.length)) {
			notifications.update({
				id: 'load-data',
				color: 'green',
				title: 'Streams was loaded',
				message: 'Successfully Loaded!!',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
		}
		if (error) {
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error Occured',
				message: 'Error Occured while fetching streams',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
		}
		if(streams && streams.length===0){
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'No Streams',
				message: 'No Streams Found in your account',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
			setActiveStream('');
			setSearchValue('');
			setDisableLink(true);
			navigate(`/`);
		}
	}, [streams, error, loading]);
	const handleCloseDelete = () => {
		closeDelete();
		setDeleteStream('');
	};
	const handleDelete = () => {
		deleteLogStreamFun(deleteStream||"");
		closeDelete();
	};

	useEffect(() => {
		if (deleteLoading) {
			notifications.show({
				id: 'delete-data',
				loading: true,
				color: '#545BEB',
				title: 'Deleting Stream',
				message: 'Stream will be deleted.',
				autoClose: false,
				withCloseButton: false,

			});
			return;
		}
		if (deleteData && !deleteLoading) {
			notifications.update({
				id: 'delete-data',
				color: 'green',
				title: 'Stream was deleted',
				message: 'Successfully Deleted!!',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
			resetDeleteStraeam();
			resetStreamArray();
			getData();
			return;
		}
		if (deleteError) {
			notifications.update({
				id: 'delete-data',
				color: 'red',
				title: 'Error Occured',
				message: 'Error Occured while deleting stream',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
			return;
		}
		if(streams && streams.length!==0 && deleteStream===streamName){
			navigate(`/${streams[0].name}/query`);
		}

	}, [deleteData, deleteError, deleteLoading,streams]);

	return (
		<MantineNavbar {...props} withBorder zIndex={1} hiddenBreakpoint={window.outerWidth + 20} hidden={isSubNavbarOpen}>
			<MantineNavbar.Section grow className={container}>
				<NavLink
					label="Log Streams"
					icon={<IconBinaryTree2 size="1.5rem" stroke={1.3} />}
					className={streamsBtn}
				/>
				<Select
					placeholder="Pick one"
					onChange={(value) => handleChange(value || '')}
					nothingFound="No options"
					value={activeStream}
					searchValue={searchValue}
					onSearchChange={(value) => setSearchValue(value)}
					onDropdownClose={() => setSearchValue(activeStream)}
					onDropdownOpen={() => setSearchValue('')}
					data={streams?.map((stream) => ({ value: stream.name, label: stream.name })) ?? []}
					searchable
					required
					className={selectStreambtn}
				/>
				{links.map((link) => {
					return (
						<NavLink
							label={link.label}
							icon={<link.icon size="1.3rem" stroke={1.2} />}
							sx={{ paddingLeft: 53 }}
							disabled={disableLink}
							onClick={() => {
								navigate(`/${activeStream}${link.pathname}`);
								setCurrentPage(link.pathname);
							}}
							key={link.label}
							className={
								link.pathname ? (window.location.pathname.includes(link.pathname) ? linkBtnActive : linkBtn) : linkBtn
							}
						/>
					);
						})}
				<NavLink
				label={"Delete"}
				icon={<IconTrash size="1.3rem" stroke={1.2} />}
				sx={{ paddingLeft: 53 }}
				onClick={openDelete}
				className={ linkBtn}
				disabled={disableLink}
			/>
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
			</MantineNavbar.Section>
			<MantineNavbar.Section className={lowerContainer}>
				<NavLink label={username} icon={<IconUser size="1.3rem" stroke={1.3} />} className={userBtn} component="a" />
				<NavLink
					label="Help"
					icon={<IconHelpCircle size="1.3rem" stroke={1.3} />}
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
			<Modal withinPortal size="md" opened={openedDelete} onClose={handleCloseDelete} title={"Delete Stream"}centered>
				<Text>Are you sure you want to delete this stream?</Text>
				<TextInput
				 type="text" 
				onChange={(e) => {
					console.log(e.target.value);
					setDeleteStream(e.target.value);
				}
				}
				 placeholder= {`Type the name of the stream to confirm. i.e: ${streamName}`} />
				
				<Box mt={10} display="flex" sx={{justifyContent:"end"}}>
				<Button variant="filled" color='red' sx={{margin:"12px"}} disabled={deleteStream===streamName?false:true}
					onClick={handleDelete}
					>
						Delete
					</Button>
					<Button onClick={handleCloseDelete} variant='filled' color='green'sx={{margin:"12px"}}>
						Cancel
					</Button>

				</Box>

			</Modal>
			<Modal withinPortal opened={opened} onClose={close} withCloseButton={false} size="sm" centered>
				<Text className={helpTitle}>Need any help?</Text>
				<Text className={helpDescription}>Here you can find useful resources and information.</Text>
				<Box>
					{helpResources.map((data) => (
						<HelpCard key={data.title} data={data} />
					))}
				</Box>
			</Modal>
		</MantineNavbar>
	);
};

const helpResources = [
	{
		image: slackLogo,
		title: 'Slack',
		description: 'Connect with us',
		href: 'https://launchpass.com/parseable',
	},
	{
		image: githubLogo,
		title: 'GitHub',
		description: 'Find resources',
		href: 'https://github.com/parseablehq/parseable',
	},
	{
		image: docImage,
		title: 'Documentation',
		description: 'Learn more',
		href: 'https://www.parseable.io/docs/introduction',
	},
];

type HelpCardProps = {
	data: (typeof helpResources)[number];
};

const HelpCard: FC<HelpCardProps> = (props) => {
	const { data } = props;

	const { classes } = useNavbarStyles();
	const { helpCard, helpCardTitle, helpCardDescription } = classes;

	return (
		<Anchor underline={false} href={data.href} target="_blank">
			<Card className={helpCard}>
				<Box>
					<Text className={helpCardTitle}>{data.title}</Text>
					<Text className={helpCardDescription}>{data.description}</Text>
				</Box>
				<Image maw={45} src={data.image} alt={data.title} />
			</Card>
		</Anchor>
	);
};

export default Navbar;
