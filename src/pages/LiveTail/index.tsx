import { Box, Button, Code, Group, ScrollArea, Stack, Table, Text, TextInput } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useRef } from 'react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import { useDoGetLiveTail } from '@/hooks/useDoGetLiveTail';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import classes from './LiveTail.module.css';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

const LiveTail: FC = () => {
	useDocumentTitle('Parseable | Live Tail');
	const {
		state: { subAppContext, subInstanceConfig },
	} = useHeaderContext();
	const [currentStreamName, setCurrentStreamName] = useMountedState<string>(subAppContext.get().selectedStream ?? '');
	const [grpcPort, setGrpcPort] = useMountedState<number | null>(subInstanceConfig.get()?.grpcPort ?? null);
	const { data, doGetLiveTail, error, loading, resetData, setSearch, abort } = useDoGetLiveTail();
	const { data: schema, loading: schemaLoading, getDataSchema, resetData: resetSchema } = useGetLogStreamSchema();
	const [tablerData, setTablerData] = useMountedState<any[]>([]);
	const [scrollPosition, onScrollPositionChange] = useMountedState({ x: 0, y: 0 });
	const scrollRef = useRef<null | HTMLDivElement>(null);

	const handleScroll = () => {
		const scrollContainer = scrollRef.current;

		if (scrollContainer) {
			const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop === scrollContainer.clientHeight;
			if (isAtBottom) {
				// Scroll is at the bottom
				console.log('Scrolled to the bottom!');
			}
		}
	};

	useEffect(() => {
		const Streamlistener = subAppContext.subscribe((state) => {
			if (state.selectedStream) {
				setCurrentStreamName(state.selectedStream);
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
	}, [subAppContext, subInstanceConfig]);

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

	const rows = tablerData.map((element: any, i) => (
		<Table.Tr key={i}>
			{schema?.fields?.map((field, i) => (
				<Table.Td key={i}>{element[field.name] ?? 'N/A'}</Table.Td>
			))}
		</Table.Tr>
	));

	useEffect(() => {
		if (tablerData.length < 90) {
			setTablerData(data);
		}
	}, [data]);

	const headerRows = schema?.fields?.map((element) => <Table.Th key={element.name}>{element.name}</Table.Th>);
	return (
		<ScrollArea
			onEnded={() => {
				console.log('ended');
			}}
			className={classes.tableWrapper}
			onScrollPositionChange={onScrollPositionChange}
			ref={scrollRef}
			onScroll={handleScroll}>
			<Table striped highlightOnHover withTableBorder withColumnBorders>
				<Table.Thead
					style={{
						position: 'sticky',
						top: 0,
						background: 'white',
					}}>
					<Table.Tr>{headerRows}</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
				<Table.Tfoot>
					<Table.Tr>
						<Table.Td colSpan={schema?.fields?.length ?? 0}>
							<Group>
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
										abort();
									}}>
									abort
								</Button>
								<Button
									variant="outline"
									color="gray"
									onClick={() => {
										setTablerData([...tablerData, ...data]);
										resetData();
									}}>
									Load recent {data.length} events
								</Button>
								<Button
									variant="outline"
									color="gray"
									onClick={() => {
										doGetLiveTail(currentStreamName, grpcPort ?? 0);
										getDataSchema(currentStreamName);
									}}>
									resume
								</Button>
								<Text>
									Scroll position: <Code>{`{ x: ${scrollPosition.x}, y: ${scrollPosition.y} }`}</Code>
								</Text>
							</Group>
						</Table.Td>
					</Table.Tr>
				</Table.Tfoot>
			</Table>
		</ScrollArea>
	);
};

export default LiveTail;
