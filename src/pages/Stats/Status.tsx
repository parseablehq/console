import { useGetLogStreamStat } from '@/hooks/useGetLogStreamStat';
import { FIXED_DURATIONS, useHeaderContext } from '@/layouts/MainLayout/Context';
import { FC, useEffect } from 'react';
import classes from './Status.module.css';
import { Box, SimpleGrid, Text, ThemeIcon, Tooltip, px } from '@mantine/core';
import dayjs from 'dayjs';
import {
	IconDatabase,
	IconInfoCircle,
	IconTimelineEventText,
	IconTransferIn,
	IconWindowMinimize,
} from '@tabler/icons-react';
import { useQueryResult } from '@/hooks/useQueryResult';
import useMountedState from '@/hooks/useMountedState';
import { HumanizeNumber, formatBytes } from '@/utils';

const Status: FC = () => {
	const [statusFIXEDDURATIONS, setStatusFIXEDDURATIONS] = useMountedState(0);
	const [status, setStatus] = useMountedState('Loading....');
	const [statusSuccess, setStatusSuccess] = useMountedState(true);
	FIXED_DURATIONS;
	const {
		state: { subAppContext },
	} = useHeaderContext();

	const { data: queryResult, getQueryData, error: errorQueryResult, resetData: resetqueryResult } = useQueryResult();

	const {
		data: dataStat,
		error: errorStat,
		loading: loadingStat,
		getLogStat,
		resetData: resetStat,
	} = useGetLogStreamStat();
	useEffect(() => {
		if (subAppContext.get().selectedStream) {
			getLogStat(subAppContext.get().selectedStream ?? '');
			getStatus();
		}
		return () => {
			resetStat();
		};
	}, []);

	useEffect(() => {
		const logQueryListener = subAppContext.subscribe((query) => {
			if (query.selectedStream) {
				setStatusFIXEDDURATIONS(0);
				resetStat();
				resetqueryResult();
				getLogStat(query.selectedStream);
				getStatus();
			}
		});

		return () => {
			logQueryListener();
		};
	}, []);

	const getStatus = async () => {
		const now = dayjs();
		const LogQuery = {
			streamName: subAppContext.get().selectedStream ?? '',
			startTime: now.subtract(FIXED_DURATIONS[statusFIXEDDURATIONS].milliseconds, 'milliseconds').toDate(),
			endTime: now.toDate(),
			access: [],
		};
		setStatusFIXEDDURATIONS(statusFIXEDDURATIONS + 1);
		getQueryData(LogQuery, `SELECT count(*) as count FROM ${subAppContext.get().selectedStream} ;`);
	};

	useEffect(() => {
		if (queryResult?.data[0] && queryResult?.data[0]['count']) {
			setStatus(`${queryResult?.data[0]['count']} events in ${FIXED_DURATIONS[statusFIXEDDURATIONS - 1].name}`);
			setStatusSuccess(true);
			return;
		}
		if (errorQueryResult) {
			setStatus(`Not Recieved any events in ${FIXED_DURATIONS[statusFIXEDDURATIONS - 1].name} and error occured`);
			setStatusSuccess(false);
			return;
		}
		if (queryResult?.data[0] && queryResult?.data[0]['count'] === 0) {
			setStatus('Loading...');
			if (FIXED_DURATIONS.length > statusFIXEDDURATIONS) {
				getStatus();
				return;
			} else {
				setStatus(`No events received ${FIXED_DURATIONS[statusFIXEDDURATIONS - 1].name}`);
				setStatusSuccess(false);
			}
		} else {
			setStatus('No events received');
			setStatusSuccess(false);
			return;
		}
	}, [queryResult, errorQueryResult]);
	const {
		container,
		headContainer,
		statusText,
		statusTextResult,
		genterateContiner,
		genterateText,
		genterateTextResult,
		statusTextFailed,
	} = classes;
	return (
		<Box className={container}>
			<Box className={headContainer}>
				<Text className={statusText}>
					<span className={statusSuccess ? statusTextResult : statusTextFailed}> {status}</span>
				</Text>

				<Box className={genterateContiner}>
					<Text className={genterateText}>
						Generated at{' '}
						<span className={genterateTextResult}>
							[
							{!loadingStat
								? errorStat
									? 'ERROR'
									: dataStat
									? dayjs(dataStat?.time).format('HH:mm DD-MM-YYYY')
									: 'Not found'
								: 'Loading'}
							]
						</span>
					</Text>
				</Box>
			</Box>
			<SimpleGrid
				cols={4}
				spacing="lg"
				//  breakpoints={[{ maxWidth: '70rem', cols: 2, spacing: 'md' }]}
				p={'md'}
				pb={0}>
				<StatCard
					data={{
						Icon: IconTimelineEventText,
						value: !loadingStat
							? !errorStat
								? dataStat?.ingestion?.count
									? HumanizeNumber(dataStat.ingestion.count)
									: '0'
								: 'ERROR'
							: 'Loading...',
						description: `Total events received ${dataStat?.ingestion.count}`,
						title: 'Events',
					}}
				/>
				<StatCard
					data={{
						Icon: IconTransferIn,
						value: !loadingStat
							? !errorStat
								? dataStat?.ingestion?.size
									? formatBytes(dataStat.ingestion.size.split(' ')[0])
									: '0'
								: 'ERROR'
							: 'Loading...',
						description: `Total ingested events size ${dataStat?.ingestion.size}`,
						title: 'Ingestion',
					}}
				/>
				<StatCard
					data={{
						Icon: IconDatabase,
						value: !loadingStat
							? !errorStat
								? dataStat?.storage?.size
									? formatBytes(dataStat.storage.size.split(' ')[0])
									: '0'
								: 'ERROR'
							: 'Loading...',
						description: `Total storage on backend (after compression) ${dataStat?.storage.size}`,
						title: 'Storage',
					}}
				/>
				<StatCard
					data={{
						Icon: IconWindowMinimize,
						value: !loadingStat
							? !errorStat
								? dataStat?.ingestion?.size
									? `${(
											100 -
											(parseInt(dataStat.storage.size.split(' ')[0]) /
												parseInt(dataStat.ingestion.size.split(' ')[0])) *
												100
									  ).toPrecision(4)} %`
									: 'NotFound'
								: 'ERROR'
							: 'Loading...',
						description: 'Compression percentage. Calculated as (events size / storage used) * 100',
						title: 'Compression ',
					}}
				/>
			</SimpleGrid>
		</Box>
	);
};

type statCardProps = {
	data: { Icon: any; title: string; description: string; value: string };
};

const StatCard: FC<statCardProps> = (props) => {
	const { data } = props;
	const {
		statCard,
		statCardTitle,
		statCardDescription,
		statCardDescriptionIcon,
		statCardIcon,
		statCardTitleValue,
		statCardText,
	} = classes;

	return (
		<Box className={statCard}>
			<ThemeIcon radius={80} className={statCardIcon} size={80}>
				<data.Icon size={px('3.2rem')} stroke={1.2} />
			</ThemeIcon>
			<Box className={statCardText}>
				<Text className={statCardTitleValue}>{data.value}</Text>
				<Text className={statCardTitle}>{data.title}</Text>
			</Box>
			<Box className={statCardDescription}>
				<Tooltip withArrow label={data.description}>
					<IconInfoCircle className={statCardDescriptionIcon} size="1.5rem" stroke={1.3} />
				</Tooltip>
			</Box>
		</Box>
	);
};
export default Status;
