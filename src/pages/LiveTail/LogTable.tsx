import { FC, useEffect } from 'react';
import { ScrollArea, Table, Box } from '@mantine/core';
import { Tbody, Thead } from '@/components/Table';
import LogRow from './LogRow';
import useMountedState from '@/hooks/useMountedState';
import Column from './Column';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useDoGetLiveTail } from '@/hooks/useDoGetLiveTail';
import EmptyBox from '@/components/Empty';
import styles from './styles/Logs.module.css';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT, LOGS_SECONDARY_TOOLBAR_HEIGHT, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';

const LogTable: FC = () => {
	const { finalData: data, doGetLiveTail, resetData, abort, loading, schema } = useDoGetLiveTail();
	const {
		state: { subInstanceConfig, subLogQuery, subLiveTailsData, maximized },
	} = useHeaderContext();

	const [grpcPort, setGrpcPort] = useMountedState<number | null>(subInstanceConfig.get()?.grpcPort ?? null);
	const [currentStreamName, setCurrentStreamName] = useMountedState<string>(subLogQuery.get().streamName ?? '');
	const [callAgain, setCallAgain] = useMountedState<boolean>(false);

	useEffect(() => {
		const streamlistener = subLogQuery.subscribe((state) => {
			if (state.streamName) {
				setCurrentStreamName(state.streamName);
			}
		});
		const portListener = subInstanceConfig.subscribe((state) => {
			if (state) {
				setGrpcPort(state.grpcPort);
			}
		});

		const liveTailStatus = subLiveTailsData.subscribe((value) => {
			if (value.liveTailStatus === 'abort') {
				abort();
			} else if (value.liveTailStatus === 'fetch') {
				setCallAgain(true);
			}
		});

		return () => {
			streamlistener();
			portListener();
			liveTailStatus();
		};
	}, [subLogQuery, subInstanceConfig, subLiveTailsData]);

	useEffect(() => {
		if (currentStreamName && grpcPort) {
			doGetLiveTail(currentStreamName, grpcPort);
		}

		return () => {
			abort();
			resetData();
		};
	}, [grpcPort, currentStreamName]);

	useEffect(() => {
		if (callAgain) {
			doGetLiveTail(currentStreamName, grpcPort);
		}
	}, [callAgain]);

	useEffect(() => {
		if (loading) {
			subLiveTailsData.set((state) => {
				state.liveTailStatus = 'streaming';
			});
		} else {
			subLiveTailsData.set((state) => {
				state.liveTailStatus = 'stopped';
			});
			setCallAgain(false);
		}
	}, [loading]);

	useEffect(() => {
		subLiveTailsData.set((state) => {
			state.liveTailSchemaData = schema;
		});
	}, [schema]);

	const headerRows = schema?.map((element) => <Column key={element.name} columnName={element.name} />);

	const classes = styles;

	const { container, tableStyle, theadStyle, tableContainer, innerContainer } = classes;

	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;

	return (
		<Box
			className={container}
			style={{
				maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
			}}>
			<Box className={innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
				<Box
					className={innerContainer}
					style={{ display: 'flex', flexDirection: 'row', maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
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
									<Thead className={theadStyle}>{headerRows}</Thead>
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

export default LogTable;
