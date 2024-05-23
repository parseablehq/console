import { Stack, Text, ThemeIcon, px } from '@mantine/core';
import classes from '../styles/SideBar.module.css';
import {
	IconBolt,
	IconChevronLeft,
	IconChevronRight,
	IconFileSettings,
} from '@tabler/icons-react';
import { useCallback } from 'react';
import { useStreamStore, streamStoreReducers } from '../providers/StreamProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { STREAM_VIEWS } from '@/constants/routes';
import _ from 'lodash';

const { toggleSideBar } = streamStoreReducers;
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

type MenuItemProps = {
	sideBarOpen: boolean;
	setCurrentView: (view: string) => void;
	currentView: string;
};

const AllLogsButton = (props: MenuItemProps) => {
	const viewName = 'explore';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${!props.sideBarOpen ? classes.shrink : ''} ${isActive ? classes.activeMenuItem : ''}`;
	const additionalStyles = isActive ? { color: 'white' } : {};
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			className={`${classes.menuItemContainer} ${additionalClassNames}`}>
			<ThemeIcon size={32} className={classes.menuIconContainer}>
				{renderlogsIcon(props.currentView === viewName)}
			</ThemeIcon>
			{props.sideBarOpen && (
				<Text style={additionalStyles} className={classes.menuLabel}>
					Explore
				</Text>
			)}
		</Stack>
	);
};

const ConfigButton = (props: MenuItemProps) => {
	const viewName = 'manage';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${!props.sideBarOpen ? classes.shrink : ''} ${isActive ? classes.activeMenuItem : ''}`;
	const additionalStyles = isActive ? { color: 'white' } : {};
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			className={`${classes.menuItemContainer} ${additionalClassNames}`}>
			<ThemeIcon className={classes.menuIconContainer}>
				<IconFileSettings style={additionalStyles} size={px('1.4rem')} stroke={1.5} />
			</ThemeIcon>
			{props.sideBarOpen && (
				<Text style={additionalStyles} className={classes.menuLabel}>
					Manage
				</Text>
			)}
		</Stack>
	);
};

const LiveTailMenu = (props: MenuItemProps) => {
	const viewName = 'live-tail';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${!props.sideBarOpen ? classes.shrink : ''} ${isActive ? classes.activeMenuItem : ''}`;
	const additionalStyles = isActive ? { color: 'white' } : {};
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			className={`${classes.menuItemContainer} ${additionalClassNames}`}>
			<ThemeIcon className={classes.menuIconContainer}>
				<IconBolt size={px('1.4rem')} stroke={1.5} style={additionalStyles} />
			</ThemeIcon>
			{props.sideBarOpen && (
				<Text style={additionalStyles} className={classes.menuLabel}>
					Live Tail
				</Text>
			)}
		</Stack>
	);
};

const SideBar = () => {
	const [sideBarOpen, setStreamStore] = useStreamStore((store) => store.sideBarOpen);
	const [currentStream] = useAppStore(store => store.currentStream)
	const {view} = useParams();
	const onToggle = useCallback(() => {
		setStreamStore((store) => toggleSideBar(store));
	}, []);
	const navigate = useNavigate();

	const setCurrentView = useCallback((view: string) => {
		if (_.includes(STREAM_VIEWS, view)) {
			navigate(`/${currentStream}/${view}`);
		}
	}, [currentStream]);

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
				<AllLogsButton sideBarOpen={sideBarOpen} setCurrentView={setCurrentView} currentView={view || ''} />
				<LiveTailMenu sideBarOpen={sideBarOpen} setCurrentView={setCurrentView} currentView={view || ''} />
				<ConfigButton sideBarOpen={sideBarOpen} setCurrentView={setCurrentView} currentView={view || ''} />
			</Stack>
		</Stack>
	);
};

export default SideBar;
