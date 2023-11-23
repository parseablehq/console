import { EmptySimple } from '@/components/Empty';
import { Text, Button, Center, Box, Table } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
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
		<Table.Tr>
			<Table.Td>{streamname}</Table.Td>
			<Table.Td>
				{!loading
					? !error
						? data?.ingestion?.count
							? HumanizeNumber(data.ingestion.count)
							: '0'
						: 'ERROR'
					: 'Loading...'}
			</Table.Td>

			<Table.Td>
				{!loading
					? !error
						? data?.ingestion?.size
							? formatBytes(data.ingestion.size.split(' ')[0])
							: '0'
						: 'ERROR'
					: 'Loading...'}
			</Table.Td>
			<Table.Td>
				{loading ? 'Loading...' : error ? 'Error' : data ? formatBytes(data?.storage.size.split(' ')[0]) : '0'}
			</Table.Td>

			<Table.Td>
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
			</Table.Td>
			<Table.Td>
				<Button
					variant="default"
					onClick={() => {
						nav(`/sql/${streamname}`);
					}}>
					Visit
				</Button>
			</Table.Td>
		</Table.Tr>
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
					padding: '1rem',
					overflow: 'auto',
				}}>
				<Box>
					<Table withColumnBorders withTableBorder striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Stream name</Table.Th>
								<Table.Th>Events</Table.Th>
								<Table.Th>Ingestion</Table.Th>
								<Table.Th>Storage</Table.Th>
								<Table.Th>Compression</Table.Th>
								<Table.Th>Query</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{appContext.userSpecificStreams.map((key) => {
								return <StreamInfo streamname={key} key={key} />;
							})}
						</Table.Tbody>
					</Table>
				</Box>
			</Box>
		);
	} else {
		return <Loading visible variant="oval" zIndex={-1} />;
	}
};

export default Home;
