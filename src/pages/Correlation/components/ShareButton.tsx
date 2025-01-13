import { Stack, Menu, px } from '@mantine/core';
import { IconCopy, IconShare, IconFileTypeCsv, IconBraces } from '@tabler/icons-react';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCallback } from 'react';
import { copyTextToClipboard } from '@/utils';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import { makeExportData } from '@/pages/Stream/providers/LogsProvider';
import IconButton from '@/components/Button/IconButton';
import { filterAndSortData, useCorrelationStore } from '../providers/CorrelationProvider';

const renderShareIcon = () => <IconShare size={px('1rem')} stroke={1.5} />;

export default function ShareButton() {
	const [isSecureHTTPContext] = useAppStore((store) => store.isSecureHTTPContext);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [{ streamData, selectedFields }] = useCorrelationStore((store) => store);
	const [{ tableOpts, fields }] = useCorrelationStore((store) => store);

	const streamNames = Object.keys(fields);

	const { pageData } = tableOpts;

	const generateAllPageData = (selectedFields: Record<string, string[]>) => {
		return Array.from({ length: 1000 })
			.map((_record, offset) => {
				const combinedRecord: any = {};

				Object.entries(selectedFields).forEach(([stream, fields]) => {
					const filteredStreamData = filterAndSortData(tableOpts, streamData[stream]?.logData || []);
					const streamRecord = filteredStreamData[offset];

					if (streamRecord && Array.isArray(fields)) {
						fields.forEach((field) => {
							combinedRecord[`${stream}.${field}`] = streamRecord[field];
						});
					}
				});

				return combinedRecord;
			})
			.filter(Boolean);
	};

	const exportHandler = useCallback(
		(fileType: string | null) => {
			let filename = 'correlation-logs';
			if (streamNames.length === 1) {
				filename = `correlation-${streamNames[0]}-logs`;
			} else if (streamNames.length > 1) {
				filename = `correlation-${streamNames[0]}-${streamNames[1]}-logs`;
			}

			if (pageData.length === 0) {
				console.error('No data to export');
				return;
			}

			const keys = Object.keys(pageData[0]);
			const exportData = makeExportData(generateAllPageData(selectedFields), keys, fileType || '');

			if (fileType === 'CSV') {
				downloadDataAsCSV(exportData, filename);
			} else if (fileType === 'JSON') {
				downloadDataAsJson(exportData, filename);
			}
		},
		[currentStream, pageData, selectedFields],
	);

	const copyUrl = useCallback(() => {
		copyTextToClipboard(window.location.href);
	}, []);

	return (
		<Menu width={200} position="bottom" withArrow shadow="md">
			<Menu.Target>
				<Stack style={{ padding: 0, background: 'transparent' }}>
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
