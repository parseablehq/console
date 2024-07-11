import { Skeleton, Stack, Text, ThemeIcon, Tooltip, Group, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { useClusterStore } from './providers/ClusterProvider';
import classes from './styles/Systems.module.css';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';
import { Sparkline } from '@mantine/charts';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useClusterInfo, useDeleteIngestor } from '@/hooks/useClusterInfo';
import { useCallback, useEffect, useState } from 'react';
import { PrometheusMetricResponse, SanitizedMetrics, parsePrometheusResponse, sanitizeIngestorData } from './utils';
import { IconAlertCircle } from '@tabler/icons-react';

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

function sanitizeIngestorUrl(url: string) {
	if (url.startsWith('http://')) {
		url = url.slice(7);
	} else if (url.startsWith('https://')) {
		url = url.slice(8);
	}

	if (url.endsWith('/')) {
		url = url.slice(0, -1);
	}

	return url;
}

const useFetchQuerierMetrics = () => {
	const [isMetricsFetching, setMetricsFetching] = useState(true);
	const [metrics, setMetrics] = useState<SanitizedMetrics | null>(null);

	const fetchData = useCallback(async () => {
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
	}, []);

	return { isQuerierMetricsFetching: isMetricsFetching, metrics, fetchQuerierMetrics: fetchData };
};

const InfoItem = (props: { title: string; value: string; width?: string; loading?: boolean }) => {
	return (
		<Stack w={props.width ? props.width : '25%'} gap={4}>
			<Text
				className={classes.fieldDescription}
				style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
				{props.title}
			</Text>
			{props.loading ? (
				<Skeleton height="1.8rem" />
			) : (
				<Text
					className={classes.fieldTitle}
					fw={400}
					style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
					{props.value}
				</Text>
			)}
		</Stack>
	);
};

const ModalTitle = () => {
	return <Text style={{ fontWeight: 600, marginLeft: '0.5rem' }}>Confirm Delete</Text>;
};

const IngestorInfo = () => {
	const [opened, { close, open }] = useDisclosure(false);
	const { deleteIngestorMutation, deleteIngestorIsLoading } = useDeleteIngestor();
	const { getClusterInfoRefetch } = useClusterInfo();
	const [recentRecord] = useClusterStore((store) => store.currentMachineRecentRecord);
	const [ingestorMachines] = useClusterStore((store) => store.ingestorMachines);
	const ingestor = _.find(ingestorMachines, (ingestor) => ingestor.domain_name === recentRecord?.address);
	const error = ingestor ? ingestor.error : null || null;
	const deleteUrl = recentRecord?.address as string;
	return (
		<Stack style={{ width: '70%', height: '100%' }} className={classes.machineInfoSection}>
			<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
				<Text fw={500}>Instance Info</Text>
				{error && (
					<Tooltip label={error}>
						<ThemeIcon className={classes.infoIcon} variant="filled" size="sm">
							<IconAlertCircle stroke={1.5} />
						</ThemeIcon>
					</Tooltip>
				)}
				{!ingestor?.reachable ? (
					<Stack style={{ width: '85%' }}>
						<Group justify="flex-end">
							<Button onClick={open} className={classes.deleteIcon} color="white">
								<IconTrash height="18" stroke={1.5} />
							</Button>
						</Group>
					</Stack>
				) : null}
			</Stack>
			<Modal size="lg" opened={opened} onClose={close} title={<ModalTitle />} centered>
				<Stack style={{ padding: '1rem 1rem 1rem 0.5rem' }}>
					<Text fw={500}> Do you want to delete {recentRecord?.address} ? </Text>
					<Group justify="flex-end" pt="1rem">
						<Button onClick={close} variant="filled">
							Cancel
						</Button>
						{!deleteIngestorIsLoading ? (
							<Button
								className={classes.deleteBtn}
								onClick={() =>
									deleteIngestorMutation({
										ingestorUrl: sanitizeIngestorUrl(deleteUrl),
										onSuccess: getClusterInfoRefetch,
									})
								}
								variant="default">
								Delete
							</Button>
						) : (
							<Button loading loaderProps={{ type: 'dots' }} />
						)}
					</Group>
				</Stack>
			</Modal>

			<Stack flex={1} style={{ justifyContent: 'space-around' }}>
				<Stack style={{ width: '100%', flexDirection: 'row' }}>
					<InfoItem title="Address" value={recentRecord?.address || ''} />
					<InfoItem title="Cache" value={recentRecord?.cache || ''} />
					<InfoItem title="Staging Files" value={HumanizeNumber(recentRecord?.parseable_staging_files || 0)} />
					<InfoItem title="Staging Size" value={formatBytes(recentRecord?.parseable_storage_size_staging || 0) || ''} />
				</Stack>
				<Stack style={{ width: '100%', flexDirection: 'row' }}>
					<InfoItem title="Commit" value={recentRecord?.commit || ''} />
					<InfoItem title="Staging Directory" width="75%" value={recentRecord?.staging || ''} />
				</Stack>
			</Stack>
		</Stack>
	);
};

const QuerierInfo = () => {
	const [currentMachine] = useClusterStore((store) => store.currentMachine);
	const [instanceConfig] = useAppStore((store) => store.instanceConfig);

	const { metrics, isQuerierMetricsFetching, fetchQuerierMetrics } = useFetchQuerierMetrics();

	useEffect(() => {
		fetchQuerierMetrics();
	}, []);

	return (
		<Stack style={{ width: '70%', height: '100%' }} className={classes.machineInfoSection}>
			<Text fw={500}>Instance Info</Text>
			<Stack flex={1} style={{ justifyContent: 'space-around' }}>
				<Stack style={{ width: '100%', flexDirection: 'row' }}>
					<InfoItem title="Address" value={currentMachine || ''} />
					<InfoItem title="Cache" value={instanceConfig?.cache || ''} />
					<InfoItem title="Commit" value={instanceConfig?.commit || ''} />
					<InfoItem title="Version" value={instanceConfig?.version || ''} />
				</Stack>
				<Stack style={{ width: '100%', flexDirection: 'row' }}>
					<InfoItem title="Memory Usage" value={metrics?.memoryUsage || ''} loading={isQuerierMetricsFetching} />
				</Stack>
			</Stack>
		</Stack>
	);
};

const MemoryInfo = () => {
	const [recentRecord] = useClusterStore((store) => store.currentMachineRecentRecord);
	const [currentMachineData] = useClusterStore((store) => store.currentMachineData);
	const usageTrend = _.chain(currentMachineData).map('process_resident_memory_bytes').reverse().value();

	return (
		<Stack className={classes.memoryInfoSection} gap={4}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text fw={500}>Memory Usage</Text>
				<Text>{formatBytes(recentRecord?.process_resident_memory_bytes || 0)}</Text>
			</Stack>
			<Stack h="100%" w="100%" flex={1}>
				<Sparkline
					w="100%"
					h="100%"
					data={usageTrend}
					trendColors={{ positive: 'red.6', negative: 'teal.6', neutral: 'gray.5' }}
					fillOpacity={0.2}
				/>
			</Stack>
		</Stack>
	);
};

const MachineInfo = (props: { isQuerier: boolean }) => {
	return (
		<Stack style={{ height: '33%', flexDirection: 'row' }}>
			{props.isQuerier ? (
				<QuerierInfo />
			) : (
				<>
					<IngestorInfo />
					<MemoryInfo />
				</>
			)}
		</Stack>
	);
};

export default MachineInfo;
