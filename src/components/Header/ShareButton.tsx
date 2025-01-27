import { IconBraces, IconCopy, IconFileTypeCsv, IconShare } from '@tabler/icons-react';
import { Menu, Stack, px } from '@mantine/core';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import { makeExportData, useLogsStore } from '@/pages/Stream/providers/LogsProvider';

import IconButton from '../Button/IconButton';
import { copyTextToClipboard } from '@/utils';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCallback } from 'react';

const renderShareIcon = () => <IconShare color="#495057" size={px('1rem')} stroke={1.5} />;

export default function ShareButton() {
	const [isSecureHTTPContext] = useAppStore((store) => store.isSecureHTTPContext);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [filteredData] = useLogsStore((store) => store.data.filteredData);
	const [tableOpts] = useLogsStore((store) => store.tableOpts);
	const { headers } = tableOpts;

	const exportHandler = useCallback(
		(fileType: string | null) => {
			const filename = `${currentStream}-logs`;
			if (fileType === 'CSV') {
				downloadDataAsCSV(makeExportData(filteredData, headers, 'CSV'), filename);
			} else if (fileType === 'JSON') {
				downloadDataAsJson(makeExportData(filteredData, headers, 'JSON'), filename);
			}
		},
		[currentStream, filteredData, headers],
	);
	const copyUrl = useCallback(() => {
		copyTextToClipboard(window.location.href);
	}, [window.location.href]);
	return (
		<Menu width={200} position="bottom" withArrow shadow="md">
			<Menu.Target>
				<Stack style={{ padding: '0', background: 'transparent' }}>
					<IconButton renderIcon={renderShareIcon} size={36} tooltipLabel="Share" />
				</Stack>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item leftSection={<IconFileTypeCsv size={15} stroke={1.02} />} onClick={() => exportHandler('CSV')}>
					Export CSV
				</Menu.Item>
				<Menu.Item leftSection={<IconBraces size={15} stroke={1.02} />} onClick={() => exportHandler('JSON')}>
					Export JSON
				</Menu.Item>
				{isSecureHTTPContext && (
					<Menu.Item leftSection={<IconCopy size={15} stroke={1.02} />} onClick={copyUrl}>
						Copy URL
					</Menu.Item>
				)}
			</Menu.Dropdown>
		</Menu>
	);
}
