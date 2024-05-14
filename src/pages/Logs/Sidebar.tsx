import { Stack, Text, px } from "@mantine/core"
import classes from './styles/SideBar.module.css'
import StreamDropdown from "@/components/Header/StreamDropdown";
import { useLogsStore, logsStoreReducers } from "./providers/LogsProvider";
import { IconBolt, IconExclamationCircle, IconFileInvoice, IconSettings, IconTrash } from "@tabler/icons-react";
import IconButton from "@/components/Button/IconButton";
import { useCallback } from "react";

const {toggleAlertsModal, toggleLiveTail} = logsStoreReducers;

type SideBarProps = {
	open: boolean;
};
const renderAlertsIcon = () => <IconExclamationCircle size={px('1.4rem')} stroke={1.5} />;
const renderSettingsIcon = () => <IconSettings size={px('1.4rem')} stroke={1.5} />;
const renderLiveTailIcon = () => <IconBolt size={px('1.4rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash size={px('1.4rem')} stroke={1.5} />;
const renderInfoIcon = () => <IconFileInvoice size={px('1.4rem')} stroke={1.5}/>

const AlertsMenu = () => {
	const [sideBarOpen, setLogsStore] = useLogsStore((store) => store.sideBarOpen);
	const onToggleAlertsModal = useCallback(() => {
		setLogsStore((store) => toggleAlertsModal(store));
	}, []);
	return (
		<Stack className={classes.menuItemContainer}>
			<IconButton renderIcon={renderAlertsIcon} onClick={onToggleAlertsModal} tooltipLabel="Alerts" />
            {sideBarOpen && <Text className={classes.menuLabel}>Alerts</Text>}
		</Stack>
	);
};

const LiveTailMenu = () => {
	const [sideBarOpen, setLogsStore] = useLogsStore((store) => store.sideBarOpen);
	const onToggleLiveTail = useCallback(() => {
		setLogsStore((store) => toggleLiveTail(store));
	}, []);
	return (
		<Stack className={classes.menuItemContainer}>
			<IconButton renderIcon={renderLiveTailIcon} onClick={onToggleLiveTail} tooltipLabel="Alerts" />
            {sideBarOpen && <Text className={classes.menuLabel}>Live Tail</Text>}
		</Stack>
	);
};

const SettingsMenu = () => {
	const [sideBarOpen, setLogsStore] = useLogsStore((store) => store.sideBarOpen);
	const onToggleAlertsModal = useCallback(() => {
		setLogsStore((store) => toggleAlertsModal(store));
	}, []);
	return (
		<Stack className={classes.menuItemContainer}>
			<IconButton renderIcon={renderSettingsIcon} onClick={onToggleAlertsModal} tooltipLabel="Alerts" />
            {sideBarOpen && <Text className={classes.menuLabel}>Settings</Text>}
		</Stack>
	);
};

const DeleteMenu = () => {
	const [sideBarOpen, setLogsStore] = useLogsStore((store) => store.sideBarOpen);
	const onToggleAlertsModal = useCallback(() => {
		setLogsStore((store) => toggleAlertsModal(store));
	}, []);
	return (
		<Stack className={classes.menuItemContainer}>
			<IconButton renderIcon={renderDeleteIcon} onClick={onToggleAlertsModal} tooltipLabel="Alerts" />
            {sideBarOpen && <Text className={classes.menuLabel}>Delete</Text>}
		</Stack>
	);
};

const InfoMenu = () => {
	const [sideBarOpen, setLogsStore] = useLogsStore((store) => store.sideBarOpen);
	const onToggleAlertsModal = useCallback(() => {
		setLogsStore((store) => toggleAlertsModal(store));
	}, []);
	return (
		<Stack className={classes.menuItemContainer}>
			<IconButton renderIcon={renderInfoIcon} onClick={onToggleAlertsModal} tooltipLabel="Alerts" />
            {sideBarOpen && <Text className={classes.menuLabel}>Info</Text>}
		</Stack>
	);
};

const SideBar = (props: SideBarProps) => {
	return (
		<Stack className={classes.container}>
			<StreamDropdown />
            <InfoMenu/>
            <LiveTailMenu/>
			<AlertsMenu />
            <SettingsMenu/>
            <DeleteMenu/>
		</Stack>
	);
};

export default SideBar;