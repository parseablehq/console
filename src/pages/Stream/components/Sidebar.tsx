import { Stack, Text, ThemeIcon, px } from '@mantine/core';
import classes from '../styles/SideBar.module.css';
import StreamDropdown from '@/components/Header/StreamDropdown';
import { useLogsStore, logsStoreReducers, currentView } from '../providers/LogsProvider';
import {
	IconBolt,
	IconChevronLeft,
	IconChevronRight,
	IconFileSettings,
	IconExclamationCircle,
	IconFileInvoice,
	IconFileStack,
	IconSettings,
	IconTrash,
} from '@tabler/icons-react';
import IconButton from '@/components/Button/IconButton';
import { useCallback } from 'react';
import { IconLogs } from '@tabler/icons-react';

const { toggleAlertsModal, toggleLiveTail, toggleSideBar, toggleCurrentView } = logsStoreReducers;

const renderlogsIcon = (isactive: boolean) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke={isactive ? 'white' : 'currentColor'}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M4 12h.01" />
			<path d="M4 6h.01" />
			<path d="M4 18h.01" />
			<path d="M8 18h2" />
			<path d="M8 12h2" />
			<path d="M8 6h2" />
			<path d="M14 6h6" />
			<path d="M14 12h6" />
			<path d="M14 18h6" />
		</svg>
	);
};

type SideBarProps = {
	open: boolean;
};
const renderAlertsIcon = () => <IconExclamationCircle size={px('1.4rem')} stroke={1.5} />;
const renderSettingsIcon = () => <IconSettings size={px('1.4rem')} stroke={1.5} />;
const renderLiveTailIcon = () => <IconBolt size={px('1.4rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash size={px('1.4rem')} stroke={1.5} />;
const renderInfoIcon = () => <IconFileInvoice size={px('1.4rem')} stroke={1.5} />;

type MenuItemProps = {
	sideBarOpen: boolean;
	setCurrentView: (view: currentView) => void;
	currentView: currentView;
};

const AllLogsButton = (props: MenuItemProps) => {
	const viewName = 'explore';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${!props.sideBarOpen ? classes.shrink : ''} ${isActive ? classes.activeMenuItem : ''}`;
	const additionalStyles = isActive ? {color: 'white'} : {};
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			className={`${classes.menuItemContainer} ${additionalClassNames}`}>
			<ThemeIcon size={32} className={classes.menuIconContainer}>{renderlogsIcon(props.currentView === viewName)}</ThemeIcon>
			{props.sideBarOpen && <Text style={additionalStyles} className={classes.menuLabel}>Explore</Text>}
		</Stack>
	);
};

const ConfigButton = (props: MenuItemProps) => {
	const viewName = 'manage';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${!props.sideBarOpen ? classes.shrink : ''} ${isActive ? classes.activeMenuItem : ''}`;
	const additionalStyles = isActive ? {color: 'white'} : {};
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			className={`${classes.menuItemContainer} ${additionalClassNames}`}>
			<ThemeIcon className={classes.menuIconContainer}>
				<IconFileSettings style={additionalStyles} size={px('1.4rem')} stroke={1.5} />
			</ThemeIcon>
			{props.sideBarOpen && <Text style={additionalStyles} className={classes.menuLabel}>Manage</Text>}
		</Stack>
	);
};

const LiveTailMenu = (props: MenuItemProps) => {
	const viewName = 'live-tail';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${!props.sideBarOpen ? classes.shrink : ''} ${isActive ? classes.activeMenuItem : ''}`;
	const additionalStyles = isActive ? {color: 'white'} : {};
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			className={`${classes.menuItemContainer} ${additionalClassNames}`}>
			<ThemeIcon className={classes.menuIconContainer}>
				<IconBolt size={px('1.4rem')} stroke={1.5} style={additionalStyles}/>
			</ThemeIcon>
			{props.sideBarOpen && <Text style={additionalStyles} className={classes.menuLabel}>Live Tail</Text>}
		</Stack>
	);
};

const SideBar = (props: SideBarProps) => {
	const [sideBarOpen, setLogsStore] = useLogsStore((store) => store.sideBarOpen);
	const [currentView] = useLogsStore((store) => store.currentView);
	const onToggle = useCallback(() => {
		setLogsStore((store) => toggleSideBar(store));
	}, []);

	const setCurrentView = useCallback((view: currentView) => {
		setLogsStore((store) => toggleCurrentView(store, view));
	}, []);

	return (
		<Stack className={classes.container}>
			<Stack className={classes.streamDropdownContainer}>
				{/* <StreamDropdown /> */}
				<Stack onClick={onToggle} className={classes.sideBarToggleContainer}>
					<ThemeIcon className={classes.sideBarToggleIconContainer} p={2}>
						{sideBarOpen ? (
							<IconChevronLeft size={px('1.8rem')} stroke={2} color="blue" />
						) : (
							<IconChevronRight size={px('1.8rem')} stroke={2} color="blue" />
						)}
					</ThemeIcon>
				</Stack>
			</Stack>
			<Stack className={classes.menuListContainer}>
				<AllLogsButton sideBarOpen={sideBarOpen} setCurrentView={setCurrentView} currentView={currentView} />
				<LiveTailMenu sideBarOpen={sideBarOpen} setCurrentView={setCurrentView} currentView={currentView} />
				<ConfigButton sideBarOpen={sideBarOpen} setCurrentView={setCurrentView} currentView={currentView} />
			</Stack>
		</Stack>
	);
};

export default SideBar;
