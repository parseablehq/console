import { Menu, Stack, px } from '@mantine/core';
import IconButton from '@/components/Button/IconButton';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import classes from './styles/Toolbar.module.css';
import { IconDownload, IconMaximize } from '@tabler/icons-react';
import { LOGS_SECONDARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import StreamingButton from '@/components/Header/StreamingButton';
import Querier from './Querier';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCallback, useEffect } from 'react';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';
import StreamDropdown from '@/components/Header/StreamDropdown';
import { notifications } from '@mantine/notifications';

const { makeExportData } = logsStoreReducers;
const renderExportIcon = () => <IconDownload size={px('1.4rem')} stroke={1.5} />;
const renderMaximizeIcon = () => <IconMaximize size={px('1.4rem')} stroke={1.5} />;

const MaximizeButton = () => {
	const [_appStore, setAppStore] = useAppStore((_store) => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderMaximizeIcon} onClick={onClick} tooltipLabel="Full Screen" />;
};

const SecondaryToolbar = () => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);
	const [showLiveTail] = useLogsStore((store) => store.liveTailConfig.showLiveTail);
	const [headers] = useLogsStore((store) => store.tableOpts.headers);
	const [filteredData] = useLogsStore((store) => store.data.filteredData);
	const exportHandler = useCallback(
		(fileType: string | null) => {
			const filename = `${currentStream}-logs`;
			if (fileType === 'CSV') {
				downloadDataAsCSV(makeExportData(filteredData, headers, 'CSV'), filename);
			} else if (fileType === 'JSON') {
				downloadDataAsJson(makeExportData(filteredData, headers, 'JSON'), filename);
			}
		},
		[currentStream],
	);

	useEffect(() => {
		if (maximized) {
			notifications.show({
				message: 'Press Esc to exit full screen',
				withBorder: true,
				autoClose: 2000,
			});
		}
	}, [maximized]);

	if (maximized) return null;

	return (
		<Stack className={classes.logsSecondaryToolbar} gap={0} style={{ height: LOGS_SECONDARY_TOOLBAR_HEIGHT }}>
			<Stack gap="0.675rem" style={{ flexDirection: 'row', width: '100%' }}>
				<StreamDropdown />
				<Querier />
				<TimeRange />
				<RefreshInterval />
				<MaximizeButton />
				<RefreshNow />
			</Stack>
			{/* {showLiveTail && (
				<Stack gap={0} style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
					<StreamingButton />
					<MaximizeButton />
				</Stack>
			)} */}
		</Stack>
	);
};

export default SecondaryToolbar;
