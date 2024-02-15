import { EmptySimple } from '@/components/Empty';
import { Text, Button, Center, Box, Group, ActionIcon, Flex } from '@mantine/core';
import { IconChevronRight, IconExternalLink } from '@tabler/icons-react';
import { useEffect, type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@mantine/hooks';
import { useLogStream } from '@/hooks/useLogStream';
import { useGetStreamMetadata } from '@/hooks/useGetStreamMetadata';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';
import { LogStreamRetention, LogStreamStat } from '@/@types/parseable/api/stream';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import cardStyles from './styles/Card.module.css';
import homeStyles from './styles/Home.module.css'

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
	const { container } = classes;
	const { getLogStreamListData, getLogStreamListIsLoading, getLogStreamListIsError } = useLogStream();
	const {
		methods: { streamChangeCleanup },
	} = useHeaderContext();
	const navigate = useNavigate();
	const { getStreamMetadata, metaData } = useGetStreamMetadata();

	const streams = Array.isArray(getLogStreamListData?.data)
		? getLogStreamListData?.data.map((stream) => stream.name) || []
		: [];

	useEffect(() => {
		if (streams.length === 0) return;
		getStreamMetadata(streams);
	}, [getLogStreamListData?.data]);

	const navigateToStream = useCallback((stream: string) => {
		streamChangeCleanup(stream);
		navigate(`/${stream}/logs`);
	}, []);

	if (getLogStreamListIsError || getLogStreamListIsLoading) return null; // implement loading state
	if (streams.length === 0) return <EmptyStreamsView />;

	return (
		<Box className={container} style={{ display: 'flex', flex: 1, marginTop: '1rem' }}>
			<Group style={{ marginRight: '1rem', marginLeft: '1rem' }}>
				{Object.entries(metaData || {}).map(([stream, data]) => {
					return <StreamInfo key={stream} stream={stream} data={data} navigateToStream={navigateToStream} />;
				})}
			</Group>
		</Box>
	);
};

export default Home;

const BigNumber = (props: { label: string; value: any; color?: string }) => {
	return (
		<Box className={cardStyles.streamBoxCol} style={{ width: '12%' }}>
			<Text size="xs" style={{ color: 'black' }}>
				{props.label}
			</Text>
			<Text fw={700} size={'xl'} className={cardStyles.bigNo}>
				{props.value}
			</Text>
		</Box>
	);
};

const sizetoInteger = (str: string) => {
	if (!str || typeof str !== 'string') return null;

	const strChuncks = str?.split(' ');
	return Array.isArray(strChuncks) && !isNaN(Number(strChuncks[0])) ? parseInt(strChuncks[0]) : null;
};

const sanitizeBytes = (str: any) => {
	const size = sizetoInteger(str);
	return size ? formatBytes(size) : '–';
};

const sanitizeCount = (val: any) => {
	return typeof val === 'number' ? HumanizeNumber(val) : '–';
};

const calcCompressionRate = (storageSize: string, ingestionSize: string) => {
	const parsedStorageSize = sizetoInteger(storageSize);
	const parsedIngestionSize = sizetoInteger(ingestionSize);

	if (parsedIngestionSize === null || parsedStorageSize === null) return '–';

	if (parsedIngestionSize === 0) return '0%';

	const rate = (100 - (parsedStorageSize / parsedIngestionSize) * 100).toPrecision(4);
	return `${rate}%`;
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
		<Group
			className={classes.streamBox}
			onClick={() => {
				navigateToStream(stream);
			}}
			style={{ width: '100%' }}>
			<Box style={{ width: 200 }}>
				<Box className={classes.streamBoxCol}>
					<Text size="xs" style={{ color: 'black' }}>
						{'Stream'}
					</Text>
					<Text fw={700} size={'lg'} style={{ color: 'black' }}>
						{stream}
					</Text>
				</Box>
			</Box>
			<BigNumber label={'Events'} value={sanitizeCount(ingestionCount)} />
			<BigNumber label={'Ingestion'} value={sanitizeBytes(ingestionSize)} />
			<BigNumber label={'Storage'} value={sanitizeBytes(storageSize)} />
			<BigNumber label={'Compression'} value={calcCompressionRate(storageSize, ingestionSize)} />
			<BigNumber label={'Retention'} value={streamRetention} />
			<Flex style={{ flex: 1, justifyContent: 'flex-end' }}>
				<Box style={{ width: '15%' }}>
					<ActionIcon variant="transparent" color="black" size={50}>
						<IconChevronRight stroke={1} />
					</ActionIcon>
				</Box>
			</Flex>
		</Group>
	);
};
