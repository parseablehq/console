import { Menu, Stack, px } from '@mantine/core';
import IconButton from '@/components/Button/IconButton';
import { useLogsPageContext } from './context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import classes from './styles/Toolbar.module.css';
import { IconDownload, IconMaximize } from '@tabler/icons-react';
import { LOGS_SECONDARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import StreamingButton from '@/components/Header/StreamingButton';
import Querier from './Querier';

const renderExportIcon = () => <IconDownload size={px('1.4rem')} stroke={1.5} />;
const renderMaximizeIcon = () => <IconMaximize size={px('1.4rem')} stroke={1.5} />;

const SecondaryToolbar = () => {
	const {
		methods: { makeExportData },
		state: { liveTailToggled },
	} = useLogsPageContext();
	const {
		state: { subLogQuery },
		methods: { resetTimeInterval, toggleMaximize },
	} = useHeaderContext();
	const exportHandler = (fileType: string | null) => {
		const query = subLogQuery.get();
		const filename = `${query.streamName}-logs`;
		if (fileType === 'CSV') {
			downloadDataAsCSV(makeExportData('CSV'), filename);
		} else if (fileType === 'JSON') {
			downloadDataAsJson(makeExportData('JSON'), filename);
		}
	};
	return (
		<Stack className={classes.logsSecondaryToolbar} gap={0} style={{ height: LOGS_SECONDARY_TOOLBAR_HEIGHT }}>
			{!liveTailToggled && (
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
					<IconButton renderIcon={renderMaximizeIcon} onClick={toggleMaximize} tooltipLabel="Full Screen" />
					<RefreshNow onRefresh={resetTimeInterval} />
				</Stack>
			)}
			{liveTailToggled && (
				<Stack gap={0} style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
					<StreamingButton />
					<IconButton renderIcon={renderMaximizeIcon} onClick={toggleMaximize} tooltipLabel="Full Screen" />
				</Stack>
			)}
		</Stack>
	);
};

export default SecondaryToolbar;
