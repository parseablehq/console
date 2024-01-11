import { useHeaderContext } from '@/layouts/MainLayout/Context';
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
import { convertToReadableScale } from '@/utils/convertToReadableScale';
import { formatBytes } from '@/utils/formatBytes';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import { useRetentionEditor } from '@/hooks/useRetentionEditor';
import { useLogStreamStats } from '@/hooks/useLogStreamStats';
import { useParams } from 'react-router-dom';

const Status: FC = () => {
	const { streamName } = useParams();

	const [statusFixedDurations, setStatusFixedDurations] = useMountedState<number>(0);
	const [fetchQueryStatus, setFetchQueryStatus] = useMountedState<string>('');

	const { getLogRetentionIsError, getLogRetentionData, getLogRetentionIsSuccess, getLogRetentionIsLoading } =
		useRetentionEditor(streamName || '');

	const {
		getLogStreamStatsData,
		getLogStreamStatsDataIsSuccess,
		getLogStreamStatsDataIsLoading,
		getLogStreamStatsDataIsError,
	} = useLogStreamStats(streamName || '');
	const { fetchQueryMutation } = useQueryResult();

	useEffect(() => {
		if (streamName) {
			getStatus();
			setStatusFixedDurations(0);
		}
	}, [streamName]);

	const getStatus = async () => {
		const now = dayjs();
		setStatusFixedDurations(statusFixedDurations + 1);
		const LogQuery = {
			streamName: streamName || '',
			startTime: now.subtract(FIXED_DURATIONS[statusFixedDurations].milliseconds, 'milliseconds').toDate(),
			endTime: now.toDate(),
			access: [],
		};
		fetchQueryMutation.mutate({
			logsQuery: LogQuery,
			query: `SELECT count(*) as count FROM ${streamName} ;`,
		});
	};

	useEffect(() => {
		const updateStatus = async () => {
			if (fetchQueryMutation.isLoading) {
				setFetchQueryStatus('Loading...');
			} else if (fetchQueryMutation.isError) {
				setFetchQueryStatus(
					`Not Received any events in ${FIXED_DURATIONS[statusFixedDurations - 1].name} and error occurred`,
				);
			} else if (fetchQueryMutation.isSuccess && fetchQueryMutation?.data[0].count) {
				setFetchQueryStatus(
					`${fetchQueryMutation?.data[0].count} events in ${FIXED_DURATIONS[statusFixedDurations - 1].name}`,
				);
			} else {
				if (FIXED_DURATIONS.length > statusFixedDurations) {
					try {
						await getStatus();
					} catch (error: unknown) {
						let errorMessage = 'An unknown error occurred';
						if (error instanceof Error) {
							errorMessage = error.message;
						} else if (typeof error === 'string') {
							errorMessage = error;
						}
						setFetchQueryStatus(`Error in fetching status: ${errorMessage}`);
					}
				} else {
					setFetchQueryStatus(`No events received ${FIXED_DURATIONS[statusFixedDurations - 1].name}`);
				}
			}
		};

		updateStatus();
	}, [fetchQueryMutation.isLoading, fetchQueryMutation.isError, fetchQueryMutation.isSuccess]);

	const generatedOn = getLogStreamStatsDataIsLoading
		? 'Loading...'
		: getLogStreamStatsDataIsError
		? 'ERROR'
		: getLogStreamStatsDataIsSuccess && getLogStreamStatsData?.data?.time
		? dayjs(getLogRetentionData?.data?.time).format('HH:mm DD-MM-YYYY')
		: 'Not Found';

	const retentionValue = getLogRetentionIsLoading
		? 'Loading...'
		: getLogRetentionIsError
		? 'ERROR'
		: getLogRetentionIsSuccess && getLogRetentionData?.data[0] && getLogRetentionData?.data[0].duration
		? `${getLogRetentionData?.data[0].duration.split('d')[0]} Days`
		: 'Not Set';

	const compressionValue = getLogStreamStatsDataIsLoading
		? 'Loading..'
		: getLogStreamStatsDataIsError
		? 'ERROR'
		: getLogStreamStatsDataIsSuccess &&
		  getLogStreamStatsData?.data?.ingestion?.size &&
		  getLogStreamStatsData?.data?.storage?.size
		? `${(
				100 -
				(parseInt(getLogStreamStatsData?.data?.storage?.size.split(' ')[0]) /
					parseInt(getLogStreamStatsData?.data?.ingestion?.size.split(' ')[0])) *
					100
		  ).toPrecision(4)} %`
		: 'Not Found';

	const storageValue = getLogStreamStatsDataIsLoading
		? 'Loading..'
		: getLogStreamStatsDataIsError
		? 'ERROR'
		: getLogStreamStatsDataIsSuccess && getLogStreamStatsData?.data?.storage?.size
		? formatBytes(Number(getLogStreamStatsData?.data?.storage.size.split(' ')[0]))
		: '0';

	const ingestionValue = getLogStreamStatsDataIsLoading
		? 'Loading..'
		: getLogStreamStatsDataIsError
		? 'ERROR'
		: getLogStreamStatsDataIsSuccess && getLogStreamStatsData?.data?.ingestion?.size
		? formatBytes(Number(getLogStreamStatsData?.data?.ingestion.size.split(' ')[0]))
		: '0';

	const eventsValue = getLogStreamStatsDataIsLoading
		? 'Loading..'
		: getLogStreamStatsDataIsError
		? 'ERROR'
		: getLogStreamStatsDataIsSuccess && getLogStreamStatsData?.data?.ingestion?.count
		? convertToReadableScale(getLogStreamStatsData?.data.ingestion.count)
		: '0';

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
					<span className={fetchQueryMutation.isSuccess ? statusTextResult : statusTextFailed}>{fetchQueryStatus}</span>
				</Text>

				<Box className={genterateContiner}>
					<Text className={genterateText}>
						Generated at <span className={genterateTextResult}>[{generatedOn}]</span>
					</Text>
				</Box>
			</Box>
			<Box className={StatsContainer}>
				<StatCard
					data={{
						Icon: IconTimelineEventText,
						value: eventsValue,
						description: `Total events received ${getLogStreamStatsData?.data?.ingestion.count}`,
						title: 'Events',
					}}
				/>
				<StatCard
					data={{
						Icon: IconTransferIn,
						value: ingestionValue,
						description: `Total ingested events size ${getLogStreamStatsData?.data?.ingestion.size}`,
						title: 'Ingestion',
					}}
				/>
				<StatCard
					data={{
						Icon: IconDatabase,
						value: storageValue,
						description: `Total storage on backend (after compression) ${getLogStreamStatsData?.data?.storage.size}`,
						title: 'Storage',
					}}
				/>
				<StatCard
					data={{
						Icon: IconWindowMinimize,
						value: compressionValue,
						description: 'Compression percentage. Calculated as (events size / storage used) * 100',
						title: 'Compression ',
					}}
				/>

				<StatCard
					data={{
						Icon: IconClockStop,
						value: retentionValue,
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
