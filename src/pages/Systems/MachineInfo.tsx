import { Skeleton, Stack, Group, Text, ThemeIcon, Tooltip, CopyButton, ActionIcon, px } from '@mantine/core';
import { useClusterStore } from './providers/ClusterProvider';
import classes from './styles/Systems.module.css';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';
import { Sparkline } from '@mantine/charts';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import DeleteIngestorModal from './DeleteIngestorModal';
import { useCallback, useEffect, useState } from 'react';
import { PrometheusMetricResponse, SanitizedMetrics, parsePrometheusResponse, sanitizeIngestorData } from './utils';
import { IconAlertCircle, IconTrash, IconCheck, IconCopy } from '@tabler/icons-react';
import IconButton from '@/components/Button/IconButton';

const renderDeleteIcon = () => <IconTrash size={px('1rem')} stroke={1.5} />;
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

const InfoItem = (props: {
	title: string;
	value: string;
	width?: string;
	loading?: boolean;
	showCopyBtn?: boolean;
}) => {
	return (
		<Stack w={props.width ? props.width : '25%'} gap={4}>
			<Group gap={0}>
				<Text
					className={classes.fieldDescription}
					style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
					{props.title}
				</Text>
				{props.showCopyBtn && (
					<CopyButton value={props.value} timeout={2000}>
						{({ copied, copy }) => (
							<Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
								<ActionIcon className={classes.copyBtn} variant="subtle" onClick={copy}>
									{copied ? <IconCheck size={12} stroke={2.2} /> : <IconCopy size={12} stroke={2.2} />}
								</ActionIcon>
							</Tooltip>
						)}
					</CopyButton>
				)}
			</Group>
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

const IngestorInfo = () => {
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [recentRecord] = useClusterStore((store) => store.currentMachineRecentRecord);
	const [ingestorMachines] = useClusterStore((store) => store.ingestorMachines);
	const ingestor = _.find(ingestorMachines, (ingestor) => ingestor.domain_name === recentRecord?.address);
	const [selectedMachine] = useClusterStore((store) => store.currentMachine);
	const ingestorInfo = _.find(ingestorMachines, (ingestor) => ingestor.domain_name === selectedMachine);
	const error = ingestor ? ingestor.error : null || null;
	const toggleDeleteModal = useCallback(() => {
		setDeleteModalOpen((prev) => !prev);
	}, []);
	return (
		<Stack style={{ width: '70%', height: '100%' }} className={classes.machineInfoSection}>
			<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
				<Group style={{ justifyContent: 'space-between', width: '100%' }}>
					<Group>
						<Text fw={500}>Instance Info</Text>
						{error && (
							<Tooltip label={error}>
								<ThemeIcon className={classes.infoIcon} variant="filled" size="sm">
									<IconAlertCircle stroke={1.5} />
								</ThemeIcon>
							</Tooltip>
						)}
					</Group>
					{!ingestorInfo?.reachable ? (
						<IconButton renderIcon={renderDeleteIcon} size={38} onClick={toggleDeleteModal} tooltipLabel="Delete" />
					) : null}
				</Group>
			</Stack>

			<DeleteIngestorModal modalOpened={isDeleteModalOpen} closeModal={toggleDeleteModal} />

			<Stack flex={1} style={{ justifyContent: 'space-around' }}>
				<Stack style={{ width: '100%', flexDirection: 'row' }}>
					<InfoItem title="Address" value={ingestorInfo?.domain_name || '–'} showCopyBtn />
					<InfoItem title="Cache" value={recentRecord?.cache || '–'} />
					<InfoItem title="Staging Files" value={HumanizeNumber(recentRecord?.parseable_staging_files || 0)} />
					<InfoItem title="Staging Size" value={formatBytes(recentRecord?.parseable_storage_size_staging || 0) || ''} />
				</Stack>
				<Stack style={{ width: '100%', flexDirection: 'row' }}>
					<InfoItem title="Commit" value={recentRecord?.commit || '–'} />
					<InfoItem title="Staging Directory" width="75%" value={ingestorInfo?.staging_path || '–'} />
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
					<InfoItem title="Address" value={currentMachine || ''} showCopyBtn />
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
