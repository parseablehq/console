import { EmptySimple } from '@/components/Empty';
import { Text, Button, Center, Box, Stack, Group } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useEffect, type FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import classes from './Home.module.css';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import { AppContext } from '@/@types/parseable/api/query';
import Loading from '@/components/Loading';
import { useGetLogStreamStat } from '@/hooks/useGetLogStreamStat';
import { HumanizeNumber, formatBytes } from '@/utils';

interface StreamInfoProp {
	streamname: string;
}
function StreamInfo({ streamname }: StreamInfoProp) {
	const { data, loading, error, getLogStat } = useGetLogStreamStat();
	useEffect(() => {
		getLogStat(streamname);
	}, []);

	return (
		<Group>
			<Text>{streamname}</Text>
			<Text>
				{!loading
					? !error
						? data?.ingestion?.count
							? HumanizeNumber(data.ingestion.count)
							: '0'
						: 'ERROR'
					: 'Loading...'}
			</Text>

			<Text>
				{!loading
					? !error
						? data?.ingestion?.size
							? formatBytes(data.ingestion.size.split(' ')[0])
							: '0'
						: 'ERROR'
					: 'Loading...'}
			</Text>
			<Text>
				{loading ? 'Loading...' : error ? 'Error' : data ? formatBytes(data?.storage.size.split(' ')[0]) : '0'}
			</Text>

			<Text>
				{!loading
					? !error
						? data?.ingestion?.size
							? `${(
									100 -
									(parseInt(data.storage.size.split(' ')[0]) / parseInt(data.ingestion.size.split(' ')[0])) * 100
							  ).toPrecision(4)} %`
							: 'NotFound'
						: 'ERROR'
					: 'Loading...'}
			</Text>
		</Group>
	);
}

const Home: FC = () => {
	const location = useLocation();
	const pathname = location.state?.from?.pathname;
	const {
		state: { subAppContext },
	} = useHeaderContext();
	const [appContext, setAppContext] = useMountedState<AppContext>(subAppContext.get());

	useEffect(() => {
		const appContextListern = subAppContext.subscribe(setAppContext);
		return () => {
			appContextListern();
		};
	}, []);

	const { container, messageStyle } = classes;
	if (pathname) {
		return <Navigate to={{ pathname }} />;
	} else if (appContext.userSpecificStreams?.length === 0) {
		return (
			<Center className={container}>
				<EmptySimple height={70} width={100} />
				<Text className={messageStyle}>No Stream found on this account</Text>
				<Button
					target="_blank"
					component="a"
					href="https://www.parseable.io/docs/category/log-ingestion"
					leftSection={<IconExternalLink size="0.9rem" />}>
					Documentation
				</Button>
			</Center>
		);
	} else if (appContext.userSpecificStreams) {
		return (
			<Box className={container}>
				<Stack >
					<Group>
						<Text>Stream name</Text>
						<Text>Events</Text>
						<Text>Ingestion</Text>
						<Text>Storage</Text>
						<Text>Compression</Text>
					</Group>
					{appContext.userSpecificStreams.map((key) => {
						return <StreamInfo streamname={key} key={key} />;
					})}
				</Stack>
			</Box>
		);
	} else {
		return <Loading visible variant="oval" zIndex={-1} />;
	}
};

export default Home;
