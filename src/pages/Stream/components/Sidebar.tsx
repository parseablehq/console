import { Stack, Tooltip } from '@mantine/core';
import classes from '../styles/SideBar.module.css';
import {
	IconBolt,
	IconChevronsRight,
	IconFilterSearch,
	IconLayoutSidebarLeftCollapse,
	IconLayoutSidebarRightCollapse,
	IconSettings2,
} from '@tabler/icons-react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { STREAM_VIEWS } from '@/constants/routes';
import _ from 'lodash';
import { streamStoreReducers, useStreamStore } from '../providers/StreamProvider';

const { toggleSideBar } = streamStoreReducers;

type MenuItemProps = {
	setCurrentView: (view: string) => void;
	currentView: string;
};

const AllLogsButton = (props: MenuItemProps) => {
	const viewName = 'explore';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${isActive ? classes.activeMenuItem : ''}`;
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			style={{ padding: '4px 0', alignItems: 'center' }}
			className={classes.menuItemContainer}>
			<Tooltip label="Explore" position="right">
				<Stack className={additionalClassNames} style={{ padding: '4px 4px' }}>
					<IconFilterSearch
						stroke={isActive ? 1.4 : 1.2}
						size="1.2rem"
						className={classes.icon}
						{...(isActive && { color: 'black' })}
					/>
				</Stack>
			</Tooltip>
		</Stack>
	);
};

const ConfigButton = (props: MenuItemProps) => {
	const viewName = 'manage';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${isActive ? classes.activeMenuItem : ''}`;
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			style={{ padding: '4px 0', alignItems: 'center' }}
			className={classes.menuItemContainer}>
			<Tooltip label="Manage" position="right">
				<Stack className={additionalClassNames} style={{ padding: '4px 4px' }}>
					<IconSettings2
						stroke={isActive ? 1.4 : 1.2}
						size="1.2rem"
						className={classes.icon}
						{...(isActive && { color: 'black' })}
					/>
				</Stack>
			</Tooltip>
		</Stack>
	);
};

const ExpandCollapseButton = () => {
	const [{ sideBarOpen }, setStreamStore] = useStreamStore((store) => store);
	return (
		<Stack
			onClick={() => setStreamStore((store) => toggleSideBar(store))}
			style={{ padding: '4px 0', alignItems: 'center', marginTop: 'auto' }}
			className={classes.menuItemContainer}>
			{/* <Tooltip label={sideBarOpen ? 'Collapse' : 'Expand'} position="right"> */}
			<Stack style={{ padding: '4px 4px' }}>
				{sideBarOpen ? (
					<IconLayoutSidebarRightCollapse stroke={1.2} size="1.2rem" className={classes.icon} color="black" />
				) : (
					<IconLayoutSidebarLeftCollapse stroke={1.2} size="1.2rem" className={classes.icon} color="black" />
				)}
			</Stack>
			{/* </Tooltip> */}
		</Stack>
	);
};

const LiveTailMenu = (props: MenuItemProps) => {
	const viewName = 'live-tail';
	const isActive = props.currentView === viewName;
	const additionalClassNames = `${isActive ? classes.activeMenuItem : ''}`;
	return (
		<Stack
			onClick={() => props.setCurrentView(viewName)}
			className={classes.menuItemContainer}
			style={{ padding: '4px 0', alignItems: 'center' }}>
			<Tooltip label="Live Tail" position="right">
				<Stack className={additionalClassNames} style={{ padding: '4px 4px' }}>
					<IconBolt
						stroke={isActive ? 1.4 : 1.2}
						size="1.2rem"
						className={classes.icon}
						{...(isActive && { color: 'black' })}
					/>
				</Stack>
			</Tooltip>
		</Stack>
	);
};

const SideBar = () => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	const [{ sideBarOpen }, setStreamStore] = useStreamStore((store) => store);
	const { view } = useParams();
	const navigate = useNavigate();

	const setCurrentView = useCallback(
		(view: string) => {
			if (_.includes(STREAM_VIEWS, view)) {
				navigate(`/${currentStream}/${view}`);
			}
		},
		[currentStream],
	);

	return (
		<Stack className={classes.container} style={{ gap: 0 }}>
			<Stack gap={0}>
				<AllLogsButton setCurrentView={setCurrentView} currentView={view || ''} />
				{isStandAloneMode && <LiveTailMenu setCurrentView={setCurrentView} currentView={view || ''} />}
				<ConfigButton setCurrentView={setCurrentView} currentView={view || ''} />
			</Stack>
			<Stack style={{ marginTop: 'auto' }}>
				<ExpandCollapseButton />
			</Stack>
			<Stack
				onClick={() => setStreamStore((store) => toggleSideBar(store))}
				style={{
					position: 'absolute',
					top: '57%',
					left: '2.75%',
					transform: 'translateY(-50%)',
					zIndex: 100,
					backgroundColor: '#fff',
					borderRadius: '50%',
				}}>
				<div
					className={`icon-wrapper ${sideBarOpen ? 'visible' : ''}`}
					style={{
						transition: 'opacity 0.3s ease, transform 0.3s ease',
						opacity: sideBarOpen ? 1 : 0,
						transform: sideBarOpen ? 'translateX(0)' : 'translateX(-10px)',
					}}>
					<IconChevronsRight />
				</div>
			</Stack>
		</Stack>
	);
};

export default SideBar;
