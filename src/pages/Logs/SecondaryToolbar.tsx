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
import { useCallback } from 'react';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';

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

	if (maximized) return null;

	return (
		<Stack className={classes.logsSecondaryToolbar} gap={0} style={{ height: LOGS_SECONDARY_TOOLBAR_HEIGHT }}>
			{!showLiveTail && (
				<Stack gap={0} style={{ flexDirection: 'row', width: '100%' }}>
					<Querier />
					<TimeRange />
					<RefreshInterval />
					<Menu position="bottom">
						<Menu.Target>
							<div>
								<IconButton renderIcon={renderExportIcon} tooltipLabel="Download" />
							</div>
						</Menu.Target>
						<Menu.Dropdown style={{}}>
							<Menu.Item onClick={() => exportHandler('CSV')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								CSV
							</Menu.Item>
							<Menu.Item onClick={() => exportHandler('JSON')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								JSON
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
					<MaximizeButton />
					<RefreshNow />
				</Stack>
			)}
			{showLiveTail && (
				<Stack gap={0} style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
					<StreamingButton />
					<MaximizeButton />
				</Stack>
			)}
		</Stack>
	);
};

export default SecondaryToolbar;
