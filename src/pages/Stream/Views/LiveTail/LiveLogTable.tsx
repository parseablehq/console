import { FC, useEffect, useState } from 'react';
import { ScrollArea, Table, Box } from '@mantine/core';
import { Tbody, Thead } from '@/components/Table';
import LogRow from './LiveLogRow';
import Column from '../../components/Column';
import { useDoGetLiveTail } from '@/hooks/useDoGetLiveTail';
import EmptyBox from '@/components/Empty';
import styles from '../../styles/Logs.module.css';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';

const { setLiveTailStatus } = logsStoreReducers;

const LiveLogTable: FC = () => {
	const { finalData: data, doGetLiveTail, resetData, abort, loading, schema } = useDoGetLiveTail();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [grpcPort] = useAppStore((store) => store.instanceConfig?.grpcPort);
	const [liveTailConfig, setLogsStore] = useLogsStore((store) => store.liveTailConfig);
	const { liveTailStatus } = liveTailConfig;
	const [callAgain, setCallAgain] = useState<boolean>(false);

	useEffect(() => {
		if (liveTailStatus === 'abort') {
			abort();
		} else if (liveTailStatus === 'fetch') {
			setCallAgain(true);
		}
	}, [liveTailStatus]);

	useEffect(() => {
		if (currentStream && grpcPort) {
			doGetLiveTail(currentStream, grpcPort);
		}

		return () => {
			abort();
			resetData();
		};
	}, [grpcPort, currentStream]);

	useEffect(() => {
		if (callAgain && !_.isEmpty(currentStream) && _.isNumber(grpcPort)) {
			doGetLiveTail(currentStream || '', grpcPort);
		}
	}, [callAgain, currentStream, grpcPort]);

	useEffect(() => {
		if (loading) {
			setLogsStore((store) => setLiveTailStatus(store, 'streaming'));
		} else {
			setLogsStore((store) => setLiveTailStatus(store, 'stopped'));
			setCallAgain(false);
		}
	}, [loading]);

	const headerRows = schema?.map((element) => <Column key={element.name} columnName={element.name} />);

	const classes = styles;

	const { container, tableStyle, liveTheadStyle, tableContainer, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box className={innerContainer}>
				<Box className={innerContainer} style={{ display: 'flex', flexDirection: 'row' }}>
					{data.length > 0 ? (
						<ScrollArea
							styles={() => ({
								scrollbar: {
									'&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
										display: 'none',
									},
								},
							})}>
							<Box className={tableContainer}>
								<Table className={tableStyle}>
									<Thead className={liveTheadStyle}>{headerRows}</Thead>
									<Tbody>
										<LogRow logData={data || []} logsSchema={schema || []} />
									</Tbody>
								</Table>
							</Box>
						</ScrollArea>
					) : (
						<EmptyBox message="No Data Available" />
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default LiveLogTable;
