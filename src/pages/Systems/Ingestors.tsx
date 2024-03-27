import { Stack, Text, Table, Tooltip, ThemeIcon, Popover, Skeleton } from '@mantine/core';
import { FC } from 'react';
import classes from './styles/Systems.module.css';
import { IconAlertCircle, IconBrandDatabricks, IconX } from '@tabler/icons-react';
import { useClusterInfo, useClusterMetrics } from '@/hooks/useClusterInfo';
import { Ingestor, IngestorMetrics } from '@/@types/parseable/api/clusterInfo';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';

type IngestorTableRow = {
	ingestor: Ingestor;
	metrics: IngestorMetrics | undefined;
};

const TrLoadingState = () => (
	<Table.Td colSpan={8}>
		<Skeleton height={30} />
	</Table.Td>
);

const TableRow = (props: IngestorTableRow) => {
	const { ingestor, metrics } = props;

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
			{!metrics ? (
				<TrLoadingState />
			) : (
				<>
					<Table.Td align="center">
						<Tooltip label={metrics.parseable_events_ingested}>
							<Text style={{fontSize: 14}}>{HumanizeNumber(metrics.parseable_events_ingested)}</Text>
						</Tooltip>
					</Table.Td>
					<Table.Td align="center">{formatBytes(metrics.parseable_storage_size.data)}</Table.Td>
					<Table.Td align="center">{formatBytes(metrics.process_resident_memory_bytes)}</Table.Td>
					<Table.Td align="center">{HumanizeNumber(metrics.parseable_staging_files)}</Table.Td>
					<Table.Td align="center">{formatBytes(metrics.parseable_storage_size.staging)}</Table.Td>
					<Table.Td>{ingestor.staging_path || ''}</Table.Td>
					<Table.Td>{ingestor.storage_path || ''}</Table.Td>
				</>
			)}
			<Table.Td align="center">
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
			<Table.Th>Staging Path</Table.Th>
			<Table.Th>Storage Path</Table.Th>
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
