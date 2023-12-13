import { EmptySimple } from '@/components/Empty';
import { Text, Button, Center, Box, Stack, Group, ActionIcon } from '@mantine/core';
import { IconChevronRight, IconExternalLink } from '@tabler/icons-react';
import { useEffect, type FC } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
	const nav = useNavigate();

	return (
		<Group
			className={classes.streamBox}
			onClick={() => {
				nav(`/explore/${streamname}`);
			}}>
			<Box className={classes.streamBoxCol} w={220}>
				<Text size="xs">Stream</Text>
				<Text fw={700} size={'xl'}>
					{streamname}
				</Text>
			</Box>
			<Box className={classes.streamBoxCol}>
				<Text size="xs">Events</Text>
				<Text fw={700} size={'xl'} c={'blue'}>
					{!loading
						? !error
							? data?.ingestion?.count
								? HumanizeNumber(data.ingestion.count)
								: '0'
							: 'ERROR'
						: 'Loading...'}
				</Text>
			</Box>
			<Box className={classes.streamBoxCol}>
				<Text size="xs">Ingestion</Text>
				<Text fw={700} size={'xl'} c={'blue'}>
					{!loading
						? !error
							? data?.ingestion?.size
								? formatBytes(data.ingestion.size.split(' ')[0])
								: '0'
							: 'ERROR'
						: 'Loading...'}
				</Text>
			</Box>

			<Box className={classes.streamBoxCol}>
				<Text size="xs">Storage</Text>
				<Text fw={700} size={'xl'} c={'orange'}>
					{!loading
						? !error
							? data?.storage?.size
								? formatBytes(data.storage.size.split(' ')[0])
								: '0'
							: 'ERROR'
						: 'Loading...'}
				</Text>
			</Box>
			<Box className={classes.streamBoxCol}>
				<Text size="xs">Compression</Text>
				<Text fw={700} size={'xl'}>
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
			</Box>
			<Box
				ta={'end'}
				style={{
					flex: '1 1 auto',
				}}>
				<ActionIcon variant="transparent" color="black" size={50}>
					<IconChevronRight stroke={1} />
				</ActionIcon>
			</Box>
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
			<Box
				style={{
					height: '100%',
					width: '100%',

					overflow: 'auto',
				}}>
				<Box
					style={{
						height: '50px',
						marginBottom: '1rem',
						boxShadow: '0px 2px 10px -4px rgba(0, 0, 0, 0.25)',
						display: 'flex',
						alignItems: 'center',
						padding: '0 1rem',
					}}>
					<Text size="xl" fw={700}>
						Your Streams
					</Text>
				</Box>

				<Stack>
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
