import { Stack, Text, Table, Tooltip, Badge, ThemeIcon, Popover } from '@mantine/core';
import { FC, useEffect } from 'react';
import classes from './styles/Systems.module.css';
import { IconBrandDatabricks, IconInfoCircleFilled, IconX } from '@tabler/icons-react';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';
import { Axios } from '@/api/axios';
import fs from 'fs';

const ingestorsData = [
	{
		status: 'online',
		errors: ['Error type 1', 'Error type 2'],
		totalMemory: 2147483648,
		consumedMemory: 1398102221,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-01-US-East',
		totalStorage: 128000000000,
		usedStorage: 110300000000,
		cpu: 49,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',
		port: 8001,
		filesCount: 2131231242,
		stagingDataSize: 42344234,
	},
	{
		status: 'online',
		errors: [],
		totalMemory: 4294967296,
		consumedMemory: 3422552064,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-02-US-East',
		totalStorage: 256000000000,
		usedStorage: 110000000000,
		cpu: 89,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',
		port: 8002,
		filesCount: 242423534,
		stagingDataSize: 23463246,
	},
	{
		status: 'offline',
		errors: [],
		totalMemory: 2147483648,
		consumedMemory: 945913408,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-03-US-East',
		totalStorage: 256000000000,
		usedStorage: 23400000000,
		cpu: 76,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',	
		port: 8003,
		filesCount: 6456323,
		stagingDataSize: 321234,
	},
	{
		status: 'online',
		errors: [],
		totalMemory: 2147483648,
		consumedMemory: 214748364,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-04-US-East',
		totalStorage: 256000000000,
		usedStorage: 67830000000,
		cpu: 56,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',
		port: 8004,
		filesCount: 7453744555,
		stagingDataSize: 9242349,
	},
];

function bytesToGB(bytes: number, appendSuffix: boolean = true) {
	if (bytes === 0) return '0 GB';

	const gigabytes = bytes / (1024 * 1024 * 1024);
	const prefix = gigabytes % 1 === 0 ? gigabytes : gigabytes.toFixed(1)

	if (!appendSuffix) return prefix;

	return `${prefix} GB`
}

const sanitizeBytes = (size: any) => {
	return formatBytes(size);
};

type UsageIndicatorProps = {
	label: string;
	percentage: number | null;
};

const UsageIndicator = (props: UsageIndicatorProps) => {
	const alarmCutOffPercentage = 79;
	const { label, percentage } = props;
	const statusClassName = percentage === null ? '' : percentage > alarmCutOffPercentage ? classes.alert : classes.ok;
	console.log(`${classes.usageLevelIndicator} ${statusClassName}`);
	return (
		<Stack
			className={`${classes.usageIndicatorContainer} ${statusClassName}`}
			style={{ width: '8rem', position: 'relative' }}>
			<Stack
				className={`${classes.usageLevelIndicator} ${statusClassName}`}
				style={{ height: '100%', width: `${percentage}%` }}
			/>
			<Text className={classes.usageIndicatorText}>{props.label}</Text>
		</Stack>
	);
};

const IngestorsTable = () => {
	const rows = ingestorsData.map((element, index) => {
		const totalErrors = element.errors.length;
		return (
			<Table.Tr key={element.name}>
				<Table.Td>
					<Stack style={{ flexDirection: 'row' }} gap={8}>
						{element.name}
						<Popover>
							<Popover.Target>
								<ThemeIcon className={classes.infoIcon} variant="light" size="sm">
									<IconInfoCircleFilled stroke={0.5} />
								</ThemeIcon>
							</Popover.Target>
							<Popover.Dropdown style={{ pointerEvents: 'none' }}>
								<Stack className={classes.infoDetailsContainer}>
									<Stack gap={0}>
										<Text className={classes.infoTitle}>Port</Text>
										<Text className={classes.infoText}>{element.port}</Text>
									</Stack>
								</Stack>
							</Popover.Dropdown>
						</Popover>
					</Stack>
				</Table.Td>
				<Table.Td align="center">{sanitizeBytes(element.usedStorage)}</Table.Td>
				
				<Table.Td>
					<Tooltip label="">
						<UsageIndicator label={`${element.cpu}%`} percentage={element.cpu} />
					</Tooltip>
				</Table.Td>
				<Table.Td>
					<Tooltip label="">
						<UsageIndicator
							label={`${bytesToGB(element.consumedMemory, false)} / ${bytesToGB(element.totalMemory)}`}
							percentage={(element.consumedMemory / element.totalMemory) * 100}
						/>
					</Tooltip>
				</Table.Td>
				
				<Table.Td align="center">{HumanizeNumber(element.filesCount)}</Table.Td>
				<Table.Td align="center">{formatBytes(element.stagingDataSize)}</Table.Td>
				<Table.Td>{element.stagingDirectory}</Table.Td>
				<Table.Td>{element.store}</Table.Td>
				<Table.Td>
					<Stack className={`${classes.statusChip} ${element.status === 'online' ? classes.online : classes.offline}`}>
						{element.status}
					</Stack>
				</Table.Td>
				<Table.Td align="center">
					{element.status === 'offline' ? (
						<Tooltip label="Remove">
							<IconX className={classes.removeIcon} stroke={2} />
						</Tooltip>
					) : null}
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<Table verticalSpacing="md">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Host</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Storage</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>CPU Usage</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Memory Usage</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Staging Files</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Staging Size</Table.Th>
					<Table.Th>Staging Path</Table.Th>
					<Table.Th>Store</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Status</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '1rem' }}></Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>{rows}</Table.Tbody>
		</Table>
	);
};

// const fetchh = async() => {
// 	return await Axios().get('http://0.0.0.0:8000/api/v1/metrics');
// };



const Ingestors: FC = () => {
	const totalMachines = ingestorsData.length;
	const totalActiveMachines = ingestorsData.filter((ingestor) => ingestor.status === 'online').length;

	useEffect(() => {
		// const res = fetchh();
		// console.log(res)
	}, [])

	return (
		<Stack className={classes.sectionContainer}>
			<Stack className={classes.sectionTitleContainer}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
					<IconBrandDatabricks stroke={1.2} />
					<Text className={classes.sectionTitle}>Ingestors</Text>
				</Stack>
				<Text >{`${totalActiveMachines}/${totalMachines} active`}</Text>
			</Stack>
			<IngestorsTable />
		</Stack>
	);
};

export default Ingestors;
