import { useGetLogStreamRetention } from '@/hooks/useGetLogStreamRetention';
import { useGetLogStreamStat } from '@/hooks/useGetLogStreamStat';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import { useStatusStyles } from './styles';
import { Box, Text } from '@mantine/core';
import dayjs from 'dayjs';

const Status: FC = () => {
	useDocumentTitle('Parseable | Login');
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const {
		data: data2,
		error: error2,
		loading: loading2,
		getLogRetention: getLogRetention,
		resetData: resetData2,
	} = useGetLogStreamRetention();
	const {
		data: dataStat,
		error: errorStat,
		loading: loadingStat,
		getLogStat,
		resetData: resetStat,
	} = useGetLogStreamStat();
	useEffect(() => {
		getLogRetention(subLogQuery.get().streamName);
		getLogStat(subLogQuery.get().streamName);
		console.log(loadingStat);
		return () => {
			resetData2();
			resetStat();
		};
	}, [subLogQuery]);

	const { classes } = useStatusStyles();
	const {
		container,
		headContainer,
		statusText,
		statusTextResult,
		genterateContiner,
		genterateText,
		genterateTextResult,
	} = classes;
	return (
		<Box className={container}>
			<Box className={headContainer}>
				<Text className={statusText}>
					Status: <span className={statusTextResult}> {'- Receiving'}</span>
				</Text>

				<Box className={genterateContiner}>
					<Text className={genterateText}>Genterated at :</Text>
					<Text className={genterateTextResult}>
						{!loadingStat
							? errorStat
								? 'ERROR'
								: dataStat
								? dayjs(dataStat?.time).format('DD-MM-YY HH:mm')
								: ''
							: 'Loading...'}
					</Text>
				</Box>
			</Box>
		</Box>
	);
};

export default Status;
