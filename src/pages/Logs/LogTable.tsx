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

const skipFields = ['p_metadata', 'p_tags'];

const LogTable: FC = () => {
	const {
		state: { subLogStreamError, subLogQuery, subLogSearch },
	} = useLogsPageContext();

	const [logStreamError, setLogStreamError] = useMountedState<string | null>(null);
	const [columnToggles, setColumnToggles] = useMountedState<Map<string, boolean>>(new Map());
	const {
		data: logsSchema,
		getDataSchema,
		resetData: resetStreamData,
		loading,
		error: logStreamSchemaError,
	} = useGetLogStreamSchema();
	const {
		pageLogData,
		setQuerySearch,
		getQueryData,
		goToPage,
		setPageLimit,
		loading: logsLoading,
		error: logsError,
		resetData: resetLogsData,
	} = useQueryLogs();

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
		const query = subLogQuery.get();

		if (logsSchema) {
			resetStreamData();
			resetLogsData();
		}

		getDataSchema(query.streamName);
		getQueryData(query);
		setColumnToggles(new Map());
	};

	useEffect(() => {
		const streamErrorListener = subLogStreamError.subscribe(setLogStreamError);
		const logSearchListener = subLogSearch.subscribe(setQuerySearch);
		const logQueryListener = subLogQuery.subscribe((query) => {
			if (query.streamName) {
				if (logsSchema) {
					resetStreamData();
					resetLogsData();
				}

				getDataSchema(query.streamName);
				getQueryData(query);
				setColumnToggles(new Map());
			}
		});

		return () => {
			streamErrorListener();
			logQueryListener();
			logSearchListener();
		};
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
			{!!pageLogData && <LogQuery />}
			{!(logStreamError || logStreamSchemaError || logsError) ? (
				!loading && !logsLoading && !!logsSchema && !!pageLogData ? (
					!!logsSchema.fields.length && !!pageLogData.data.length ? (
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
										<LogRow logData={pageLogData.data} logsSchema={logsSchema.fields} isColumnActive={isColumnActive} />
									</Tbody>
								</Table>
							</ScrollArea>
							<Box className={footerContainer}>
								{pageLogData.totalPages > 1 && (
									<Pagination
										withEdges
										total={pageLogData.totalPages}
										value={pageLogData.page}
										onChange={(page) => {
											goToPage(page, pageLogData.limit);
										}}
									/>
								)}
								<LimitControl value={pageLogData.limit} onChange={setPageLimit} />
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

type LimitControlProps = {
	value: number;
	onChange: (limit: number) => void;
};

const LimitControl: FC<LimitControlProps> = (props) => {
	const { value, onChange } = props;

	const [opened, setOpened] = useMountedState(false);

	const toggle = () => {
		setOpened(!opened);
	};

	const onSelect = (limit: number) => {
		if (value !== limit) {
			onChange(limit);
		}
	};

	const { classes, cx } = useLogTableStyles();
	const { limitContainer, limitBtn, limitBtnText, limitActive } = classes;

	return (
		<Box className={limitContainer}>
			<Menu withArrow withinPortal shadow="md" opened={opened} onChange={setOpened}>
				<Center>
					<Menu.Target>
						<Box onClick={toggle} className={limitBtn}>
							<Text className={limitBtnText}>{value}</Text>
							<IconSelector size={px('1rem')} />
						</Box>
					</Menu.Target>
				</Center>
				<Menu.Dropdown>
					{LOG_QUERY_LIMITS.map((limit) => {
						return (
							<Menu.Item
								className={cx([], {
									[limitActive]: value === limit,
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
