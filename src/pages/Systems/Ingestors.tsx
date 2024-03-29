import { Stack, Text, Table, Tooltip, ThemeIcon, Skeleton, Box, Loader } from '@mantine/core';
import { FC } from 'react';
import classes from './styles/Systems.module.css';
import { IconAlertCircle, IconBrandDatabricks, IconX } from '@tabler/icons-react';
import { useClusterInfo, useClusterMetrics, useDeleteIngestor } from '@/hooks/useClusterInfo';
import { Ingestor, IngestorMetrics } from '@/@types/parseable/api/clusterInfo';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';

type IngestorTableRow = {
	ingestor: Ingestor;
	metrics: IngestorMetrics | undefined;
};

const TrLoadingState = () => (
	<Table.Td colSpan={7}>
		<Skeleton height={30} />
	</Table.Td>
);

function sanitizeIngestorUrl(url: string) {
    if (url.startsWith("http://")) {
        url = url.slice(7);
    } else if (url.startsWith("https://")) {
        url = url.slice(8);
    }
    
    if (url.endsWith("/")) {
        url = url.slice(0, -1);
    }
    
    return url;
}

const TableRow = (props: IngestorTableRow) => {
	const { ingestor, metrics } = props;
	const isOfflineIngestor = !ingestor.reachable;
	const { deleteIngestorMutation, deleteIngestorIsLoading } = useDeleteIngestor();
	const {getClusterInfoRefetch} = useClusterInfo()
	return (
		<Table.Tr key={ingestor.domain_name}>
			<Table.Td>
				<Stack style={{ flexDirection: 'row' }} gap={8}>
					{ingestor.domain_name}
					{!ingestor.reachable && (
						<Tooltip label={ingestor.error}>
							<ThemeIcon className={classes.infoIcon} variant="filled" size="sm">
								<IconAlertCircle stroke={1.5} />
							</ThemeIcon>
						</Tooltip>
					)}
				</Stack>
			</Table.Td>
			{!metrics && !isOfflineIngestor ? (
				<TrLoadingState />
			) : (
				<>
					<Table.Td align="center">
						<Tooltip label={metrics?.parseable_events_ingested}>
							<Text style={{ fontSize: 14 }}>
								{isOfflineIngestor ? '–' : HumanizeNumber(metrics?.parseable_events_ingested || 0)}
							</Text>
						</Tooltip>
					</Table.Td>
					<Table.Td align="center">
						{isOfflineIngestor ? '–' : formatBytes(metrics?.parseable_storage_size.data || 0)}
					</Table.Td>
					<Table.Td align="center">
						{isOfflineIngestor ? '–' : formatBytes(metrics?.process_resident_memory_bytes || 0)}
					</Table.Td>
					<Table.Td align="center">
						{isOfflineIngestor ? '–' : HumanizeNumber(metrics?.parseable_staging_files || 0)}
					</Table.Td>
					<Table.Td align="center">
						{isOfflineIngestor ? '–' : formatBytes(metrics?.parseable_storage_size.staging || 0)}
					</Table.Td>
					<Table.Td>{ingestor.staging_path || 'Unknown'}</Table.Td>
					<Table.Td> {ingestor.storage_path || 'Unknown'}</Table.Td>
				</>
			)}
			<Table.Td align="center">
				<Stack className={`${classes.statusChip} ${ingestor.reachable ? classes.online : classes.offline}`}>
					{ingestor.reachable ? 'Online' : 'Offline'}
				</Stack>
			</Table.Td>
			<Table.Td align="center">
				{!ingestor.reachable ? (
					<Box onClick={() => deleteIngestorMutation({ ingestorUrl: sanitizeIngestorUrl(ingestor.domain_name), onSuccess: getClusterInfoRefetch })}>
						{deleteIngestorIsLoading ? (
							<Loader size="sm" />
						) : (
							<Tooltip label="Remove">
								<IconX className={classes.removeIcon} stroke={2} />
							</Tooltip>
						)}
					</Box>
				) : null}
			</Table.Td>
		</Table.Tr>
	);
};

type IngestorTable = {
	ingestors: Ingestor[] | undefined;
	allMetrics: IngestorMetrics[] | undefined;
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
			<Table.Th style={{ maxWidth: 100 }}>Staging Path</Table.Th>
			<Table.Th style={{ maxWidth: 100 }}>Storage Path</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
			<Table.Th style={{ textAlign: 'center', width: '1rem' }}></Table.Th>
		</Table.Tr>
	</Table.Thead>
);

const IngestorsTable = (props: IngestorTable) => {
	const { ingestors, allMetrics } = props;
	if (!ingestors || !allMetrics) return null;

	return (
		<Table verticalSpacing="md">
			<TableHead />
			<Table.Tbody>
				{ingestors.map((ingestor) => {
					const metrics = allMetrics.find((ingestorMetric) => ingestorMetric.address === ingestor.domain_name);
					return <TableRow ingestor={ingestor} metrics={metrics} />;
				})}
			</Table.Tbody>
		</Table>
	);
};

const Ingestors: FC = () => {
	const { clusterInfoData, getClusterInfoSuccess } = useClusterInfo();
	const { clusterMetrics, getClusterMetricsSuccess } = useClusterMetrics();
	const showTable =
		getClusterInfoSuccess &&
		getClusterMetricsSuccess &&
		Array.isArray(clusterInfoData?.data) &&
		Array.isArray(clusterMetrics?.data);
	if (!showTable) return null;

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
			<IngestorsTable ingestors={clusterInfoData?.data} allMetrics={clusterMetrics?.data} />
		</Stack>
	);
};

export default Ingestors;
