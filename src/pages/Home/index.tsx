import { EmptySimple } from '@/components/Empty';
import { Text, Button, Center, Box, Group, ActionIcon, Stack, Tooltip, ScrollArea } from '@mantine/core';
import { IconChevronRight, IconExternalLink, IconPlus } from '@tabler/icons-react';
import { useEffect, type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@mantine/hooks';
import { useGetStreamMetadata } from '@/hooks/useGetStreamMetadata';
import { calcCompressionRate, formatBytes, sanitizeEventsCount } from '@/utils/formatBytes';
import { LogStreamRetention, LogStreamStat } from '@/@types/parseable/api/stream';
import cardStyles from './styles/Card.module.css';
import homeStyles from './styles/Home.module.css';
import CreateStreamModal from './CreateStreamModal';
import { useAppStore, appStoreReducers } from '@/layouts/MainLayout/providers/AppProvider';

const { changeStream, toggleCreateStreamModal } = appStoreReducers;

const EmptyStreamsView: FC = () => {
	const classes = homeStyles;
	const { messageStyle, btnStyle, noDataViewContainer } = classes;
	return (
		<Center className={noDataViewContainer}>
			<EmptySimple height={70} width={100} />
			<Text className={messageStyle}>No Stream found on this account</Text>
			<Button
				target="_blank"
				component="a"
				href="https://www.parseable.io/docs/category/log-ingestion"
				className={btnStyle}
				leftSection={<IconExternalLink size="0.9rem" />}>
				Documentation
			</Button>
		</Center>
	);
};

const Home: FC = () => {
	useDocumentTitle('Parseable | Streams');
	const classes = homeStyles;
	const { container, createStreamButton } = classes;
	const navigate = useNavigate();
	const { getStreamMetadata, metaData } = useGetStreamMetadata();
	const [userSpecificStreams, setAppStore] = useAppStore((store) => store.userSpecificStreams);
	const [userAccessMap] = useAppStore((store) => store.userAccessMap);

	useEffect(() => {
		if (!Array.isArray(userSpecificStreams) || userSpecificStreams.length === 0) return;
		getStreamMetadata(userSpecificStreams.map((stream) => stream.name));
	}, [userSpecificStreams]);

	const navigateToStream = useCallback((stream: string) => {
		setAppStore((store) => changeStream(store, stream));
		navigate(`/${stream}/explore`);
	}, []);

	const displayEmptyPlaceholder = Array.isArray(userSpecificStreams) && userSpecificStreams.length === 0;
	const openCreateStreamModal = useCallback(() => {
		setAppStore((store) => toggleCreateStreamModal(store));
	}, []);

	return (
		<>
			<Stack
				style={{
					margin: '1rem',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexDirection: 'row',
				}}>
				<Text style={{ fontSize: '0.8rem' }} fw={500}>
					All Streams
				</Text>
				<Box>
					{userAccessMap.hasCreateStreamAccess && (
						<Button
							variant="outline"
							className={createStreamButton}
							onClick={openCreateStreamModal}
							leftSection={<IconPlus stroke={2} size={'1rem'} />}>
							Create Stream
						</Button>
					)}
				</Box>
			</Stack>
			<ScrollArea>
				<Box className={container} style={{ display: 'flex', flex: 1, paddingBottom: '3rem' }}>
					<CreateStreamModal />
					{displayEmptyPlaceholder ? (
						<EmptyStreamsView />
					) : (
						<Group style={{ marginRight: '1rem', marginLeft: '1rem', gap: '1rem' }}>
							{Object.entries(metaData || {}).map(([stream, data]) => {
								return <StreamInfo key={stream} stream={stream} data={data} navigateToStream={navigateToStream} />;
							})}
						</Group>
					)}
				</Box>
			</ScrollArea>
		</>
	);
};

export default Home;

const BigNumber = (props: { label: string; value: any; color?: string }) => {
	return (
		<Box className={cardStyles.streamBoxCol} style={{ width: '11%' }}>
			<Text style={{ color: 'black', fontSize: '0.6rem' }}>{props.label}</Text>
			<Text fw={700} className={cardStyles.bigNo}>
				{props.value}
			</Text>
		</Box>
	);
};

const bytesStringToInteger = (str: string) => {
	if (!str || typeof str !== 'string') return null;

	const strChuncks = str?.split(' ');
	return Array.isArray(strChuncks) && !isNaN(Number(strChuncks[0])) ? parseInt(strChuncks[0]) : null;
};

const sanitizeBytes = (str: any) => {
	const size = bytesStringToInteger(str);
	return size ? formatBytes(size) : '–';
};

type StreamInfoProps = {
	stream: string;
	data: {
		stats: LogStreamStat | {};
		retention: LogStreamRetention | [];
	};
	navigateToStream: (stream: string) => void;
};

const StreamInfo: FC<StreamInfoProps> = (props) => {
	const classes = cardStyles;
	const {
		stream,
		data: { stats = {}, retention = [] },
		navigateToStream,
	} = props;
	const streamRetention = retention?.length ? retention[0].duration : 'Not Set';
	const ingestionCount = (stats as LogStreamStat)?.ingestion?.count;
	const ingestionSize = (stats as LogStreamStat)?.ingestion?.size;
	const storageSize = (stats as LogStreamStat)?.storage?.size;
	return (
		<Stack
			className={classes.streamBox}
			onClick={() => {
				navigateToStream(stream);
			}}>
			<Box style={{ width: 200 }}>
				<Box className={classes.streamBoxCol}>
					<Tooltip label={stream}>
						<Text fw={600} style={{ color: 'black', fontSize: '0.75rem' }} lineClamp={1}>
							{stream}
						</Text>
					</Tooltip>
				</Box>
			</Box>
			<BigNumber label={'Events'} value={sanitizeEventsCount(ingestionCount)} />
			<BigNumber label={'Ingestion'} value={sanitizeBytes(ingestionSize)} />
			<BigNumber label={'Storage'} value={sanitizeBytes(storageSize)} />
			<BigNumber label={'Compression'} value={calcCompressionRate(storageSize, ingestionSize)} />
			<BigNumber label={'Retention'} value={streamRetention} />
			<Stack style={{ justifyContent: 'flex-end', flex: 1, alignItems: 'flex-end' }}>
				<Box style={{ width: '15%' }}>
					<ActionIcon variant="transparent" color="black" size={50}>
						<IconChevronRight stroke={1} />
					</ActionIcon>
				</Box>
			</Stack>
		</Stack>
	);
};
