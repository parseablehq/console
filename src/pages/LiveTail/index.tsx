import { Box, Button, ScrollArea, Table, Text, TextInput } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import { useLiveTailStyles } from './styles';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import { useDoGetLiveTail } from '@/hooks/useDoGetLiveTail';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

const LiveTail: FC = () => {
	useDocumentTitle('Parseable | Live Tail');
	const {
		state: { subLogQuery, subInstanceConfig },
	} = useHeaderContext();
	const [currentStreamName, setCurrentStreamName] = useMountedState<string>(subLogQuery.get().streamName);
	const [grpcPort, setGrpcPort] = useMountedState<number | null>(subInstanceConfig.get()?.grpcPort ?? null);
	const { data, doGetLiveTail, error, loading, resetData, setSearch } = useDoGetLiveTail();
	const { data: schema, loading: schemaLoading, getDataSchema, resetData: resetSchema } = useGetLogStreamSchema();
	const [tablerData, setTablerData] = useMountedState<any[]>([]);

	useEffect(() => {
		const Streamlistener = subLogQuery.subscribe((state) => {
			if (state) {
				console.log(grpcPort, currentStreamName);
				setCurrentStreamName(state.streamName);
			}
		});
		const portListener = subInstanceConfig.subscribe((state) => {
			if (state) {
				setGrpcPort(state.grpcPort);
			}
		});

		return () => {
			Streamlistener();
			portListener();
		};
	}, [subLogQuery, subInstanceConfig]);

	useEffect(() => {
		if (currentStreamName && grpcPort) {
			doGetLiveTail(currentStreamName, grpcPort);
			getDataSchema(currentStreamName);
		}
	}, [currentStreamName, grpcPort]);

	useEffect(() => {
		return () => {
			resetData();
			resetSchema();
		};
	}, []);

	const { classes } = useLiveTailStyles();
	const { container } = classes;

	const rows = tablerData.map((element: any, i) => (
		<tr key={i}>
			{schema?.fields?.map((field, i) => (
				<td key={i}>{element[field.name] ?? 'N/A'}</td>
			))}
		</tr>
	));

	useEffect(() => {
		if (tablerData.length < 10) {
			setTablerData(data);
		}
	}, [data]);

	const headerRows = schema?.fields?.map((element) => <th key={element.name}>{element.name}</th>);
	return (
		<Box className={container}>
			<Box
				h={HEADER_HEIGHT}
				sx={(theme) => ({
					background: theme.colors.gray[0],

					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: `1px solid ${theme.colors.gray[2]}`,
					paddingLeft: theme.spacing.md,
					paddingRight: theme.spacing.md,
				})}>
				<Text>Live Tail</Text>
				<TextInput
					onChange={(event) => {
						console.log(event.currentTarget.value);
						setSearch(event.currentTarget.value);
						resetData();
						setTablerData([]);
					}}></TextInput>
				<Button
					variant="outline"
					color="gray"
					onClick={() => {
						setTablerData(data);
						resetData();
					}}>
					Load recent {data.length} events
				</Button>
			</Box>

			<ScrollArea style={{ height: `calc(100vh - ${2 * HEADER_HEIGHT}px)`, width: `calc(100vw - ${NAVBAR_WIDTH}}px)` }}>
				<Table striped>
					<thead>
						<tr>{headerRows}</tr>
					</thead>
					<tbody>{rows}</tbody>
				</Table>
			</ScrollArea>
		</Box>
	);
};

export default LiveTail;
