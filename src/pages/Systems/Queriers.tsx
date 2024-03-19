// import { Stack, Text, Table, Tooltip } from '@mantine/core';
// import { FC } from 'react';
// import classes from './styles/Systems.module.css';
// import { IconBrandDatabricks, IconHeartRateMonitor } from '@tabler/icons-react';
// import { formatBytes } from '@/utils/formatBytes';

// const elements = [
// 	{ position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
// 	{ position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
// 	{ position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
// 	{ position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
// 	{ position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
// ];

// const ingestorsData = [
// 	{
// 		status: 'online',
// 		errors: ['Error type 1', 'Error type 2'],
// 		totalMemory: 2147483648,
// 		consumedMemory: 1398102221,
// 		ip: '127.0.0.1',
// 		region: 'US-East',
// 		name: 'Querier-01-US-East',
// 		totalStorage: 128000000000,
// 		usedStorage: 110300000000,
// 		cpu: 49,
// 		stagingDirectory: '/parseable/stage',
// 		store: '/parseable/data',
// 		port: 8001,
// 	},
// ];

// const systemsData = {};

// const sizetoInteger = (str: string) => {
// 	if (!str || typeof str !== 'string') return null;

// 	const strChuncks = str?.split(' ');
// 	return Array.isArray(strChuncks) && !isNaN(Number(strChuncks[0])) ? parseInt(strChuncks[0]) : null;
// };

// const sanitizeBytes = (size: any) => {
// 	// const size = sizetoInteger(str);
// 	// return size ? formatBytes(size) : '–';
// 	return formatBytes(size);
// };

// type UsageIndicatorProps = {
// 	label: string;
// 	percentage: number | null;
// };

// const UsageIndicator = (props: UsageIndicatorProps) => {
// 	const alarmCutOffPercentage = 79;
// 	const { label, percentage } = props;
// 	const statusClassName = percentage === null ? '' : percentage > alarmCutOffPercentage ? classes.alert : classes.ok;
// 	return (
// 		<Stack
// 			className={`${classes.usageIndicatorContainer} ${statusClassName}`}
// 			style={{ width: '8rem', position: 'relative' }}>
// 			<Stack
// 				className={`${classes.usageLevelIndicator} ${statusClassName}`}
// 				style={{ height: '100%', width: `${percentage}%` }}
// 			/>
// 			<Text className={classes.usageIndicatorText}>{props.label}</Text>
// 		</Stack>
// 	);
// };

// const IngestorsTable = () => {
// 	const rows = ingestorsData.map((element, index) => {
// 		return (
// 			<Table.Tr key={element.name}>
// 				<Table.Td>{element.name}</Table.Td>
// 				<Table.Td>
// 					<Tooltip label="">
// 						<UsageIndicator label={`${element.cpu}%`} percentage={element.cpu} />
// 					</Tooltip>
// 				</Table.Td>
// 				<Table.Td>
// 					<Tooltip label="">
// 						<UsageIndicator
// 							label={sanitizeBytes(element.consumedMemory)}
// 							percentage={(element.consumedMemory / element.totalMemory) * 100}
// 						/>
// 					</Tooltip>
// 				</Table.Td>
// 				<Table.Td>
// 					<Tooltip label="">
// 						<UsageIndicator
// 							label={sanitizeBytes(element.usedStorage)}
// 							percentage={(element.usedStorage / element.totalStorage) * 100}
// 						/>
// 					</Tooltip>
// 				</Table.Td>
// 				<Table.Td>{element.stagingDirectory}</Table.Td>
// 				<Table.Td>{element.store}</Table.Td>
// 				<Table.Td>
// 					<Stack className={`${classes.statusChip} ${element.status === 'online' ? classes.online : classes.offline}`}>
// 						{element.status}
// 					</Stack>
// 				</Table.Td>
// 			</Table.Tr>
// 		);
// 	});

// 	return (
// 		<Table verticalSpacing="md">
// 			<Table.Thead>
// 				<Table.Tr>
// 					<Table.Th>Host</Table.Th>
// 					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>CPU Usage</Table.Th>
// 					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Memory Usage</Table.Th>
// 					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Storage Usage</Table.Th>
// 					<Table.Th>Staging</Table.Th>
// 					<Table.Th>Store</Table.Th>
// 					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Status</Table.Th>
// 				</Table.Tr>
// 			</Table.Thead>
// 			<Table.Tbody>{rows}</Table.Tbody>
// 		</Table>
// 	);
// };

// const Queriers: FC = () => {
// 	const totalMachines = ingestorsData.length;
// 	const totalActiveMachines = ingestorsData.filter((ingestor) => ingestor.status === 'online').length;

// 	return (
// 		<Stack className={classes.sectionContainer}>
// 			<Stack className={classes.sectionTitleContainer}>
// 				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
// 					<IconHeartRateMonitor stroke={1.2} />
// 					<Text className={classes.sectionTitle}>Querier</Text>
// 				</Stack>
// 			</Stack>
// 			<IngestorsTable />
// 		</Stack>
// 	);
// };

// export default Queriers;
