import Loading from '@/components/Loading';
import { Tbody, Th, Thead } from '@/components/Table';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useQueryLogs } from '@/hooks/useQueryLogs';
import { Box, Center, Checkbox, Menu, Pagination, ScrollArea, Table, px, ActionIcon } from '@mantine/core';
import dayjs from 'dayjs';
import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useLogsPageContext } from './Context';
import LogRow from './LogRow';
import { useLogTableStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';
import ErrorText from '@/components/Text/ErrorText';
import { IconDotsVertical } from '@tabler/icons-react';
import { Field } from '@/@types/parseable/dataType';
import EmptyBox from '@/components/Empty';

const skipFields = ['p_metadata', 'p_tags'];

const LogTable: FC = () => {
	const {
		state: { subSelectedStream, subLogStreamError },
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

	useEffect(() => {
		const listener = subLogStreamError.subscribe(setLogStreamError);
		return () => listener();
	}, []);

	useEffect(() => {
		const listener = subSelectedStream.subscribe((streamName) => {
			if (logsSchema) {
				resetData();
				resetLogsData();
			}
			getDataSchema(streamName);
			setColumnToggles(new Map());
		});

		return () => listener();
	}, [logsSchema]);

	useEffect(() => {
		if (logsSchema) {
			getQueryData({
				startTime: dayjs('2023-05-01T20:59:59.999Z').toDate(),
				streamName: subSelectedStream.get(),
			});
		}
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

	const { classes, theme } = useLogTableStyles();

	const { container, tableContainer, tableStyle, theadStyle } = classes;
	const { heights } = theme.other;

	return (
		<Box className={container}>
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

							{logs.totalPages > 1 && (
								<Pagination
									mt="md"
									total={logs.totalPages}
									value={logs.page}
									onChange={(value) => {
										getQueryData({
											startTime: dayjs('2023-05-01T20:59:59.999Z').toDate(),
											streamName: subSelectedStream.get(),
											page: value,
										});
									}}
								/>
							)}
						</Fragment>
					) : (
						<EmptyBox message="No Data Available" />
					)
				) : (
					<Loading visible variant="oval" position="absolute" />
				)
			) : (
				<Center h={heights.full}>
					<ErrorText>{logStreamError || logStreamSchemaError || logsError}</ErrorText>
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

	const [opened, setOpened] = useState(false);

	const toggle = () => {
		setOpened(!opened);
	};

	const { classes } = useLogTableStyles();
	const { thColumnMenuBtn, thColumnMenuDropdown } = classes;

	return (
		<th>
			<Menu
				withArrow
				withinPortal
				shadow="md"
				position="left-start"
				width={'auto'}
				opened={opened}
				onChange={setOpened}
				zIndex={2}
				closeOnItemClick={false}>
				<Center>
					<Menu.Target>
						<ActionIcon onClick={toggle} className={thColumnMenuBtn}>
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

export default LogTable;
