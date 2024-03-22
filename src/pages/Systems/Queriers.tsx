import { Stack, Text, Table, Tooltip, Skeleton } from '@mantine/core';
import { FC, useEffect, useState } from 'react';
import classes from './styles/Systems.module.css';
import { IconHeartRateMonitor } from '@tabler/icons-react';
import { PrometheusMetricResponse, SanitizedMetrics, parsePrometheusResponse, sanitizeIngestorData } from './utils';

const fetchIngestorMetrics = async () => {
	const endpoint = `/api/v1/metrics`;
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
	<Table.Td colSpan={1}>
		<Skeleton height={30} />
	</Table.Td>
);

const TableRow = () => {
	const [isMetricsFetching, setMetricsFetching] = useState(true);
	const [metrics, setMetrics] = useState<SanitizedMetrics | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const readableStream = await fetchIngestorMetrics();
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
		<Table.Tr key={window.location.host}>
			<Table.Td>
				<Stack style={{ flexDirection: 'row' }} gap={8}>
					{window.location.host}
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
				</>
			)}
			<Table.Td align='center'>
				<Stack className={`${classes.statusChip} ${classes.online}`}>
					{'Online'}
				</Stack>
			</Table.Td>
		</Table.Tr>
	);
};

const TableHead = () => (
	<Table.Thead>
		<Table.Tr>
			<Table.Th>Domain</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Memory Usage</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
			<Table.Th style={{ textAlign: 'center', width: '1rem' }}></Table.Th>
		</Table.Tr>
	</Table.Thead>
);

const QuerierTable = () => {
	return (
		<Table verticalSpacing="md">
			<TableHead />
			<Table.Tbody>
            <TableRow />
			</Table.Tbody>
		</Table>
	);
};

const Querier: FC = () => {
	return (
		<Stack className={classes.sectionContainer}>
			<Stack className={classes.sectionTitleContainer}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
					<IconHeartRateMonitor stroke={1.2} />
					<Text className={classes.sectionTitle}>Querier</Text>
				</Stack>
			</Stack>
			<QuerierTable />
		</Stack>
	);
};

export default Querier;
