import Loading from '@/components/Loading';
import { Tbody, Th, Thead } from '@/components/Table';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { Box, Center, Checkbox, Menu, Pagination, ScrollArea, Table, px, ActionIcon, Text } from '@mantine/core';
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { LOG_QUERY_LIMITS, useLogsPageContext } from './Context';
import LogRow from './LogRow';
import { useLogTableStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';
import ErrorText from '@/components/Text/ErrorText';
import { IconDotsVertical, IconSelector } from '@tabler/icons-react';
import { Field } from '@/@types/parseable/dataType';
import EmptyBox from '@/components/Empty';
import { RetryBtn } from '@/components/Button/Retry';
import LogQuery from './LogQuery';
import { whereFields } from '@/utils';

const skipFields = ['p_metadata', 'p_tags'];

const LogTable: FC = () => {
	const {
		state: { subLogStreamError, subLogQuery },
	} = useLogsPageContext();

	const [logStreamError, setLogStreamError] = useMountedState<string | null>(null);
	const [columnToggles, setColumnToggles] = useMountedState<Map<string, boolean>>(new Map());
	const { data: logsSchema, getDataSchema, resetData, loading, error: logStreamSchemaError } = useGetLogStreamSchema();
	const { data: logs, getQueryData, loading: logsLoading, error: logsError, resetData: resetLogsData } = useQueryLogs();

	const isColumnActive = useCallback(
		(columnName: string) => {
			if (!columnToggles.has(columnName)) return true;

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return columnToggles.get(columnName)!;
		},
		[columnToggles],
	);

	const toggleColumn = (columnName: string, value: boolean) => {
		setColumnToggles(new Map(columnToggles.set(columnName, value)));
	};

	const onRetry = () => {
		resetData();
		resetLogsData();

		const query = subLogQuery.get();
		const { streamName, searchText } = query;
		getDataSchema(streamName);

		setColumnToggles(new Map());
		if (logsSchema) {
			const fields = logsSchema.fields;
			const where = whereFields(fields, searchText);

			getQueryData(query, where);
		}
	};

	useEffect(() => {
		const streamErrorListener = subLogStreamError.subscribe(setLogStreamError);
		const logQueryListener = subLogQuery.subscribe((query) => {
			const fields = logsSchema?.fields ?? [];
			const where = whereFields(fields, query.searchText);

			getQueryData(query, where);
		});

		return () => {
			streamErrorListener();
			logQueryListener();
		};
	}, [logsSchema]);

	useEffect(() => {
		const listener = subLogQuery.subscribe((query) => {
			if (query.streamName) {
				if (logsSchema) {
					resetData();
					resetLogsData();
				}
				getDataSchema(query.streamName);
				setColumnToggles(new Map());
			}
		});

		return () => listener();
	}, [logsSchema]);

	const renderTh = useMemo(() => {
		if (logsSchema) {
			return logsSchema.fields.map((field) => {
				if (!isColumnActive(field.name) || skipFields.includes(field.name)) return null;

				return <Th key={field.name} text={field.name} />;
			});
		}

		return null;
	}, [logsSchema, columnToggles]);

	const { classes } = useLogTableStyles();

	const { container, tableContainer, tableStyle, theadStyle, errorContainer, footerContainer } = classes;

	return (
		<Box className={container}>
			{!!logs && <LogQuery />}
			{!(logStreamError || logStreamSchemaError || logsError) ? (
				!loading && !logsLoading && !!logsSchema && !!logs ? (
					!!logsSchema.fields.length && !!logs.data.length ? (
						<Fragment>
							<ScrollArea className={tableContainer} type="never">
								<Table className={tableStyle}>
									<Thead className={theadStyle}>
										{renderTh}
										<ThColumnMenu
											logSchemaFields={logsSchema.fields}
											columnToggles={columnToggles}
											toggleColumn={toggleColumn}
											isColumnActive={isColumnActive}
										/>
									</Thead>
									<Tbody>
										<LogRow logData={logs.data} logsSchema={logsSchema.fields} isColumnActive={isColumnActive} />
									</Tbody>
								</Table>
							</ScrollArea>
							<Box className={footerContainer}>
								{logs.totalPages > 1 && (
									<Pagination
										withEdges
										total={logs.totalPages}
										value={logs.page}
										onChange={(value) => {
											subLogQuery.set((state) => {
												state.page = value;
											});
										}}
									/>
								)}
								<LimitControl />
							</Box>
						</Fragment>
					) : (
						<EmptyBox message="No Data Available" />
					)
				) : (
					<Loading visible variant="oval" position="absolute" zIndex={0} />
				)
			) : (
				<Center className={errorContainer}>
					<ErrorText>{logStreamError || logStreamSchemaError || logsError}</ErrorText>
					{(logsError || logStreamSchemaError) && <RetryBtn onClick={onRetry} mt="md" />}
				</Center>
			)}
		</Box>
	);
};

type ThColumnMenuProps = {
	logSchemaFields: Array<Field>;
	columnToggles: Map<string, boolean>;
	toggleColumn: (columnName: string, value: boolean) => void;
	isColumnActive: (columnName: string) => boolean;
};

const ThColumnMenu: FC<ThColumnMenuProps> = (props) => {
	const { logSchemaFields, isColumnActive, toggleColumn } = props;

	const { classes } = useLogTableStyles();
	const { thColumnMenuBtn, thColumnMenuDropdown } = classes;

	return (
		<th>
			<Menu withArrow withinPortal shadow="md" position="left-start" zIndex={2} closeOnItemClick={false}>
				<Center>
					<Menu.Target>
						<ActionIcon className={thColumnMenuBtn}>
							<IconDotsVertical size={px('1.2rem')} />
						</ActionIcon>
					</Menu.Target>
				</Center>
				<Menu.Dropdown className={thColumnMenuDropdown}>
					{logSchemaFields.map((field) => {
						if (skipFields.includes(field.name)) return null;

						return (
							<Menu.Item key={field.name} style={{ cursor: 'default' }}>
								<Checkbox
									color="red"
									label={field.name}
									checked={isColumnActive(field.name)}
									onChange={(event) => toggleColumn(field.name, event.currentTarget.checked)}
								/>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</th>
	);
};

const LimitControl: FC = () => {
	const {
		state: { subLogQuery },
	} = useLogsPageContext();
	const [selectedLimit, setSelectedLimit] = useMountedState(subLogQuery.get().limit);
	const [opened, setOpened] = useMountedState(false);

	const toggle = () => {
		setOpened(!opened);
	};

	const onSelect = (value: number) => {
		if (subLogQuery.get().limit !== value) {
			subLogQuery.set((state) => {
				state.limit = value;
				state.page = 1;
			});
		}
	};

	useEffect(() => {
		const listener = subLogQuery.subscribe((query) => {
			setSelectedLimit(query.limit);
		});

		return () => listener();
	}, []);

	const { classes, cx } = useLogTableStyles();
	const { limitContainer, limitBtn, limitBtnText, limitActive } = classes;

	return (
		<Box className={limitContainer}>
			<Menu withArrow withinPortal shadow="md" opened={opened} onChange={setOpened}>
				<Center>
					<Menu.Target>
						<Box onClick={toggle} className={limitBtn}>
							<Text className={limitBtnText}>{selectedLimit}</Text>
							<IconSelector size={px('1rem')} />
						</Box>
					</Menu.Target>
				</Center>
				<Menu.Dropdown>
					{LOG_QUERY_LIMITS.map((limit) => {
						return (
							<Menu.Item
								className={cx([], {
									[limitActive]: selectedLimit === limit,
								})}
								key={limit}
								onClick={() => onSelect(limit)}>
								<Center>
									<Text>{limit}</Text>
								</Center>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</Box>
	);
};

export default LogTable;
