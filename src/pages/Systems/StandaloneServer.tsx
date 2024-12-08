import { Stack, Text, Table, Tooltip, Skeleton } from '@mantine/core';
import { FC, useEffect, useState } from 'react';
import classes from './styles/Systems.module.css';
import { IconBrandDatabricks } from '@tabler/icons-react';
import { PrometheusMetricResponse, SanitizedMetrics, parsePrometheusResponse, sanitizeIngestorData } from './utils';
import { useAbout } from '@/hooks/useGetAbout';
import { AboutData } from '@/@types/parseable/api/about';

type IngestorTableRow = {
	stagingPath: string;
	storePath: string;
};

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
	<Table.Td colSpan={7}>
		<Skeleton height={30} />
	</Table.Td>
);

const TableRow = (props: IngestorTableRow) => {
	const [isMetricsFetching, setMetricsFetching] = useState(true);
	const [metrics, setMetrics] = useState<SanitizedMetrics | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const readableStream = await fetchIngestorMetrics();
				const reader = readableStream?.getReader();
				const chunks: string[] = [];
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
				const data = chunks.join('');
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
					{`${window.location.protocol}//${window.location.host}`}
				</Stack>
			</Table.Td>
			{isMetricsFetching || metrics === null ? (
				<TrLoadingState />
			) : (
				<>
					<Table.Td align="center">
						<Tooltip label={metrics.totalEventsIngested}>
							<Text style={{ fontSize: 14 }}>{metrics.totalEventsIngested}</Text>
						</Tooltip>
					</Table.Td>
					<Table.Td align="center">{metrics.totalBytesIngested}</Table.Td>
					<Table.Td align="center">{metrics.memoryUsage}</Table.Td>
					<Table.Td align="center">{metrics.stagingFilesCount}</Table.Td>
					<Table.Td align="center">{metrics.stagingSize}</Table.Td>
					<Table.Td>{props.stagingPath || ''}</Table.Td>
					<Table.Td>{props.storePath || ''}</Table.Td>
				</>
			)}
			<Table.Td align="center">
				<Stack className={`${classes.statusChip} ${classes.online}`}>{'Online'}</Stack>
			</Table.Td>
		</Table.Tr>
	);
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
			<Table.Th>Store</Table.Th>
			<Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
			<Table.Th style={{ textAlign: 'center', width: '1rem' }}></Table.Th>
		</Table.Tr>
	</Table.Thead>
);

const ServerTable = (props: AboutData) => {
	return (
		<Table verticalSpacing="md">
			<TableHead />
			<Table.Tbody>
				<TableRow storePath={props.store.path} stagingPath={props.staging} />
			</Table.Tbody>
		</Table>
	);
};

const StandaloneServer: FC = () => {
	const { getAboutData } = useAbout();
	return (
		<Stack className={classes.sectionContainer}>
			<Stack className={classes.sectionTitleContainer}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
					<IconBrandDatabricks stroke={1.2} />
					<Text className={classes.sectionTitle}>Parseable Server</Text>
				</Stack>
			</Stack>
			{getAboutData?.data && <ServerTable {...getAboutData.data} />}
		</Stack>
	);
};

export default StandaloneServer;
