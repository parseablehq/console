import { Stack, Text, Table, Tooltip, ThemeIcon, Popover, Skeleton } from '@mantine/core';
import { FC, useEffect, useState } from 'react';
import classes from './styles/Systems.module.css';
import { IconAlertCircle, IconBrandDatabricks, IconX } from '@tabler/icons-react';
import { useClusterInfo } from '@/hooks/useClusterInfo';
import { Ingestor } from '@/@types/parseable/api/clusterInfo';
import { PrometheusMetricResponse, SanitizedMetrics, parsePrometheusResponse, sanitizeIngestorData } from './utils';

type IngestorTableRow = {
	ingestor: Ingestor;
};

const fetchIngestorMetrics = async (domain: string) => {
	const endpoint = `${domain}api/v1/metrics`;
	const response = await fetch(endpoint, {
		headers: {
			Accept: 'text/plain',
		},
	});

	if (!response.ok) {
		throw new Error('Network response was not ok');
	}

	return response.body;
};

const TrLoadingState = () => (
	<Table.Td colSpan={9}>
		<Skeleton height={30} />
	</Table.Td>
);

const TableRow = (props: IngestorTableRow) => {
	const { ingestor } = props;
	const [isMetricsFetching, setMetricsFetching] = useState(true);
	const [metrics, setMetrics] = useState<SanitizedMetrics | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const readableStream = await fetchIngestorMetrics(ingestor.domain_name);
				const reader = readableStream?.getReader();
				const chunks:string[] = [];
				const readData = async () => {
					while (reader) {
						const { done, value } = await reader.read();
						if (done) {
							console.log('Stream reading complete');
							break;
						}
						const chunk = new TextDecoder().decode(value);
						chunks.push(chunk);
					}
				};
				await readData();
				const data = chunks.join('')
				if (typeof data !== 'string') throw 'Invalid prometheus response';

				const parsedMetrics: PrometheusMetricResponse | null = parsePrometheusResponse(data);
				const sanitizedMetrics = parsedMetrics === null ? null : sanitizeIngestorData(parsedMetrics);
				setMetrics(sanitizedMetrics);
				setMetricsFetching(false);
			} catch (error) {
				console.log('Error fetching metrics', error);
			}
		};

		fetchData();
	}, []);

	return (
		<Table.Tr key={ingestor.domain_name}>
			<Table.Td>
				<Stack style={{ flexDirection: 'row' }} gap={8}>
					{ingestor.domain_name}
					{ingestor.status === 'offline' && (
						<Popover>
							<Popover.Target>
								<ThemeIcon className={classes.infoIcon} variant="filled" size="sm">
									<IconAlertCircle stroke={1.5} />
								</ThemeIcon>
							</Popover.Target>
							<Popover.Dropdown style={{ pointerEvents: 'none' }}>
								<Text className={classes.infoText}>{ingestor.error}</Text>
							</Popover.Dropdown>
						</Popover>
					)}
				</Stack>
			</Table.Td>
			{isMetricsFetching || metrics === null ? (
				<TrLoadingState />
			) : (
				<>
					<Table.Td align="center">
						<Tooltip label={metrics.totalEventsIngested}>
							<Text>{metrics.totalEventsIngested}</Text>
						</Tooltip>
					</Table.Td>
					<Table.Td align="center">{metrics.totalBytesIngested}</Table.Td>
					<Table.Td align="center">{metrics.memoryUsage}</Table.Td>
					<Table.Td align="center">{metrics.stagingFilesCount}</Table.Td>
					<Table.Td align="center">{metrics.stagingSize}</Table.Td>
					<Table.Td>{ingestor.staging_path || ''}</Table.Td>
					<Table.Td>{ingestor.storage_mode || ''}</Table.Td>
					<Table.Td>{ingestor.storage_path || ''}</Table.Td>
				</>
			)}
			<Table.Td align='center'>
				<Stack className={`${classes.statusChip} ${ingestor.reachable ? classes.online : classes.offline}`}>
					{ingestor.reachable ? 'Online' : 'Offline'}
				</Stack>
			</Table.Td>
			<Table.Td align="center">
				{!ingestor.reachable ? (
					<Tooltip label="Remove">
						<IconX className={classes.removeIcon} stroke={2} />
					</Tooltip>
				) : null}
			</Table.Td>
		</Table.Tr>
	);
};

type IngestorTable = {
	ingestors: Ingestor[];
};

const TableHead = () => (
	<Table.Thead>
		<Table.Tr>
			<Table.Th>Domain</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Events Ingested</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Storage</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Memory Usage</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Staging Files</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Staging Size</Table.Th>
			<Table.Th>Staging Path</Table.Th>
			<Table.Th>Storage Mode</Table.Th>
			<Table.Th>Storage Path</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
			<Table.Th style={{ textAlign: 'center', width: '1rem' }}></Table.Th>
		</Table.Tr>
	</Table.Thead>
);

const IngestorsTable = (props: IngestorTable) => {
	const { ingestors } = props;
	return (
		<Table verticalSpacing="md">
			<TableHead />
			<Table.Tbody>
				{ingestors.map((ingestor) => {
					return <TableRow ingestor={ingestor} />;
				})}
			</Table.Tbody>
		</Table>
	);
};

const Ingestors: FC = () => {
	const { clusterInfoData, getClusterInfoSuccess } = useClusterInfo();
	if (!getClusterInfoSuccess || !Array.isArray(clusterInfoData?.data)) return null;

	const totalActiveMachines = clusterInfoData?.data.filter((ingestor) => ingestor.reachable).length;
	const totalMachines = clusterInfoData?.data.length;
	return (
		<Stack className={classes.sectionContainer}>
			<Stack className={classes.sectionTitleContainer}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
					<IconBrandDatabricks stroke={1.2} />
					<Text className={classes.sectionTitle}>Ingestors</Text>
				</Stack>
				<Text>{`${totalActiveMachines} / ${totalMachines} Active`}</Text>
			</Stack>
			{clusterInfoData?.data && <IngestorsTable ingestors={clusterInfoData?.data} />}
		</Stack>
	);
};

export default Ingestors;
