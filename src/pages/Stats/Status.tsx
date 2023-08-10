import { useGetLogStreamRetention } from '@/hooks/useGetLogStreamRetention';
import { useGetLogStreamStat } from '@/hooks/useGetLogStreamStat';
import { FIXED_DURATIONS, useHeaderContext } from '@/layouts/MainLayout/Context';
import { FC, useEffect } from 'react';
import { useStatCardStyles, useStatusStyles } from './styles';
import { Box, Text, ThemeIcon, Tooltip, px } from '@mantine/core';
import dayjs from 'dayjs';
import {
	IconClockStop,
	IconDatabase,
	IconInfoCircle,
	IconTimelineEventText,
	IconTransferIn,
	IconWindowMinimize,
} from '@tabler/icons-react';
import { useQueryResult } from '@/hooks/useQueryResult';
import useMountedState from '@/hooks/useMountedState';
function convert(val: number) {
	// Thousands, millions, billions etc..
	let s = ['', ' K', ' M', ' B', ' T'];

	// Dividing the value by 3.
	let sNum = Math.floor(('' + val).length / 3);

	// Calculating the precised value.
	let sVal = parseFloat((sNum != 0 ? val / Math.pow(1000, sNum) : val).toPrecision(4));

	if (sVal % 1 != 0) {
		return sVal.toFixed(1) + s[sNum];
	}

	// Appending the letter to precised val.
	return sVal + s[sNum];
}
function formatBytes(a: any, b = 1) {
	if (!+a) return '0 Bytes';
	const c = 0 > b ? 0 : b,
		d = Math.floor(Math.log(a) / Math.log(1024));
	return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
		['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][d]
	}`;
}

const Status: FC = () => {
	const [statusFIXEDDURATIONS, setStatusFIXEDDURATIONS] = useMountedState(0);
	const [status, setStatus] = useMountedState('Loading....');
	const [statusSuccess, setStatusSuccess] = useMountedState(true);
	FIXED_DURATIONS;
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const {
		data: dataRetention,
		error: errorRetention,
		loading: loadingRetention,
		getLogRetention: getLogRetention,
		resetData: resetDataRetention,
	} = useGetLogStreamRetention();
	const { data: queryResult, getQueryData, error: errorQueryResult, resetData: resetqueryResult } = useQueryResult();

	const {
		data: dataStat,
		error: errorStat,
		loading: loadingStat,
		getLogStat,
		resetData: resetStat,
	} = useGetLogStreamStat();
	useEffect(() => {
		if (subLogQuery.get().streamName) {
			getLogRetention(subLogQuery.get().streamName);
			getLogStat(subLogQuery.get().streamName);
			getStatus();
		}
		return () => {
			resetDataRetention();
			resetStat();
		};
	}, []);

	useEffect(() => {
		const logQueryListener = subLogQuery.subscribe((query) => {
			if (query.streamName) {
				setStatusFIXEDDURATIONS(0);
				resetDataRetention();
				resetStat();
				resetqueryResult();
				getLogRetention(query.streamName);
				getLogStat(query.streamName);
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
			streamName: subLogQuery.get().streamName,
			startTime: now.subtract(FIXED_DURATIONS[statusFIXEDDURATIONS].milliseconds, 'milliseconds').toDate(),
			endTime: now.toDate(),
		};
		getQueryData(LogQuery, `SELECT count(*) as count FROM ${subLogQuery.get().streamName} ;`);
	};

	useEffect(() => {
		if (queryResult?.data[0] && queryResult?.data[0]['count']) {
			setStatus(`${queryResult?.data[0]['count']} events in ${FIXED_DURATIONS[statusFIXEDDURATIONS-1].name}`);
			setStatusSuccess(true);
			return;
		}
		if (errorQueryResult) {
			setStatus(`Not Recieved any events in ${FIXED_DURATIONS[statusFIXEDDURATIONS - 1].name} and error `);
			setStatusSuccess(false);
			return;
		}
		if (queryResult?.data[0] && queryResult?.data[0]['count'] === 0) {
			setStatus('Loading...');
			if (FIXED_DURATIONS.length  > statusFIXEDDURATIONS) {
				getStatus();
				setStatusFIXEDDURATIONS(statusFIXEDDURATIONS + 1);
				return;
			} else {
				setStatus(`No events received ${FIXED_DURATIONS[statusFIXEDDURATIONS-1].name}`);
				setStatusSuccess(false);
			}
		} else {
			setStatus(`No events received`);
			setStatusSuccess(false);
			return;
		}
	}, [queryResult, errorQueryResult]);
	const { classes } = useStatusStyles();
	const {
		container,
		headContainer,
		statusText,
		statusTextResult,
		genterateContiner,
		genterateText,
		genterateTextResult,
		StatsContainer,
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
			<Box className={StatsContainer}>
				<StatCard
					data={{
						Icon: IconTimelineEventText,
						value: !loadingStat
							? !errorStat
								? dataStat?.ingestion?.count
									? convert(dataStat.ingestion.count)
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

				<StatCard
					data={{
						Icon: IconClockStop,
						value: !loadingRetention
							? !errorRetention
								? dataRetention && dataRetention[0] && dataRetention[0].duration
									? ` ${dataRetention[0].duration.split('d')[0]} Days`
									: 'Not Set'
								: 'ERROR'
							: 'Loading...',
						description: 'Retention period for events in the stream',
						title: 'Retention',
					}}
				/>
			</Box>
		</Box>
	);
};

type statCardProps = {
	data: { Icon: any; title: string; description: string; value: string };
};

const StatCard: FC<statCardProps> = (props) => {
	const { data } = props;
	const { classes } = useStatCardStyles();
	const { statCard, statCardTitle, statCardDescription, statCardDescriptionIcon, statCardIcon, statCardTitleValue } =
		classes;

	return (
		<Box className={statCard}>
			<Box className={statCardDescription}>
				<Tooltip withArrow label={data.description}>
					<IconInfoCircle className={statCardDescriptionIcon} size="1.5rem" stroke={1.3} />
				</Tooltip>
			</Box>
			<ThemeIcon radius={80} className={statCardIcon} size={80}>
				<data.Icon size={px('3.2rem')} stroke={1.2} />
			</ThemeIcon>
			<Text className={statCardTitleValue}>{data.value}</Text>
			<Text className={statCardTitle}>{data.title}</Text>
		</Box>
	);
};
export default Status;
