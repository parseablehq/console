import { EmptySimple } from '@/components/Empty';
import { Text, Button, Center, Box, Group, ActionIcon, Flex } from '@mantine/core';
import { IconChevronRight, IconExternalLink } from '@tabler/icons-react';
import { useEffect, type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardStyles, useHomeStyles } from './styles';
import { useDocumentTitle } from '@mantine/hooks';
import { useLogStream } from '@/hooks/useLogStream';
import { useGetStreamMetadata } from '@/hooks/useGetStreamMetadata';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';
import { LogStreamRetention, LogStreamStat } from '@/@types/parseable/api/stream';
import { useHeaderContext } from '@/layouts/MainLayout/Context';

const EmptyStreamsView: FC = () => {
	const { classes } = useHomeStyles();
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
				leftIcon={<IconExternalLink size="0.9rem" />}>
				Documentation
			</Button>
		</Center>
	);
};

const Home: FC = () => {
	useDocumentTitle('Parseable | Streams');
	const { classes } = useHomeStyles();
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
		<Box className={container}>
			<Group>
				{Object.entries(metaData || {}).map(([stream, data]) => {
					return <StreamInfo key={stream} stream={stream} data={data} navigateToStream={navigateToStream} />;
				})}
			</Group>
		</Box>
	);
};

export default Home;

const BigNumber = (props: { label: string; value: any; color?: string }) => {
	const { classes } = cardStyles();

	return (
		<Box className={classes.streamBoxCol}>
			<Text size="xs">{props.label}</Text>
			<Text fw={700} size={'xl'} c={props.color || 'black'}>
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
	const { classes } = cardStyles();
	const {
		stream,
		data: { stats = {}, retention = [] },
		navigateToStream,
	} = props;
	const streamRetention = retention?.length ? retention[0].duration : '–';
	const ingestionCount = (stats as LogStreamStat)?.ingestion?.count;
	const ingestionSize = (stats as LogStreamStat)?.ingestion?.size;
	const storageSize = (stats as LogStreamStat)?.storage?.size;
	return (
		<Group
			className={classes.streamBox}
			onClick={() => {
				navigateToStream(stream);
			}}
			w="100%">
			<Box style={{ width: 200 }}>
				<BigNumber label={'Stream'} value={stream} />
			</Box>
			<BigNumber label={'Events'} value={sanitizeCount(ingestionCount)} color="blue" />
			<BigNumber label={'Ingestion'} value={sanitizeBytes(ingestionSize)} color="blue" />
			<BigNumber label={'Storage'} value={sanitizeBytes(storageSize)} color="orange" />
			<BigNumber label={'Compression'} value={calcCompressionRate(storageSize, ingestionSize)} color="blue" />
			<BigNumber label={'Retention'} value={streamRetention} color={retention?.length ? 'indigo' : 'red'} />
			<Flex style={{ flex: 1, justifyContent: 'flex-end' }}>
				<ActionIcon variant="transparent" color="black" size={50}>
					<IconChevronRight stroke={1} />
				</ActionIcon>
			</Flex>
		</Group>
	);
};
