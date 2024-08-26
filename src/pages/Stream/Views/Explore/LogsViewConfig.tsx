import { LOGS_CONFIG_SIDEBAR_WIDTH } from '@/constants/theme';
import { Checkbox, ScrollArea, Skeleton, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import classes from '../../styles/LogsViewConfig.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { Field } from '@/@types/parseable/dataType';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { IconGripVertical, IconPin, IconPinFilled } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const { toggleConfigViewType, toggleDisabledColumns, setOrderedHeaders, togglePinnedColumns } = logsStoreReducers;

const Header = () => {
	const [configViewType, setLogsStore] = useLogsStore((store) => store.tableOpts.configViewType);

	const onToggle = useCallback(() => {
		setLogsStore(toggleConfigViewType);
	}, []);
	return (
		<Stack className={classes.headerContainer} gap={0}>
			<Stack
				className={`${classes.headerItem} ${configViewType === 'schema' && classes.activeHeader}`}
				onClick={onToggle}>
				<Text className={classes.headerItemText}>Schema</Text>
			</Stack>
			<Stack
				className={`${classes.headerItem} ${configViewType === 'columns' && classes.activeHeader}`}
				onClick={onToggle}>
				<Text className={classes.headerItemText}>Columns</Text>
			</Stack>
		</Stack>
	);
};

const SchemaItem = (props: { schemaField: Field }) => {
	const {
		schemaField: { name, data_type },
	} = props;
	const sanitizedDataType = _.isObject(data_type) ? _.toString(_.keys(data_type)[0]) : _.toString(data_type);
	return (
		<Stack className={classes.schemaItemContainer} gap={0}>
			<Stack className={classes.fieldName}>
				<Tooltip label={name}>
					<Text className={classes.fieldNameText} style={{ width: LOGS_CONFIG_SIDEBAR_WIDTH * 0.5 }}>
						{name}
					</Text>
				</Tooltip>
			</Stack>
			<Stack className={classes.fieldDataType}>
				<Text className={classes.fieldDataTypeText}>{sanitizedDataType}</Text>
			</Stack>
		</Stack>
	);
};

const SearchBar = (props: {
	disabled: boolean;
	value: string;
	onChangeHandler: (e: ChangeEvent<HTMLInputElement>) => void;
	placeholder: string;
}) => {
	const { placeholder, value, onChangeHandler } = props;
	return (
		<Stack className={classes.searchBarContainer}>
			<TextInput placeholder={placeholder} value={value} onChange={onChangeHandler} />
		</Stack>
	);
};

const SchemaList = (props: { isLoading: boolean }) => {
	const [schema] = useStreamStore((store) => store.schema);
	const [searchValue, setSearchValue] = useState<string>('');

	const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
	}, []);

	const schemaFields = useMemo(() => {
		const fields = _.get(schema, 'fields', []);
		if (_.isEmpty(searchValue)) return fields;

		const regex = new RegExp(searchValue, 'i');
		return _.filter(fields, (field) => regex.test(field.name));
	}, [searchValue, schema?.fields]);

	if (props.isLoading) return <LoadingView />;

	return (
		<>
			<SearchBar
				placeholder="Search Schema"
				value={searchValue}
				onChangeHandler={onChangeHandler}
				disabled={_.isEmpty(schemaFields)}
			/>
			<ScrollArea style={{ flex: 1 }}>
				{_.map(schemaFields, (schemaField, index) => {
					return <SchemaItem key={index} schemaField={schemaField} />;
				})}
			</ScrollArea>
		</>
	);
};

const ColumnItem = (props: {
	column: string;
	visible: boolean;
	onToggleColumn: (column: string) => void;
	pinned: boolean;
	onPinColumn: (column: string) => void;
}) => {
	const onToggle = useCallback(() => {
		props.onToggleColumn(props.column);
	}, []);

	const onPin = useCallback(() => {
		props.onPinColumn(props.column);
	}, []);

	return (
		<Stack className={classes.columnItemContainer} gap={8} style={{ cursor: 'default', alignItems: 'center' }}>
			<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
				<Stack style={{ cursor: 'pointer' }} onClick={onPin}>
					{props.pinned ? (
						<IconPinFilled className={classes.columnPinIcon} size="1rem" />
					) : (
						<IconPin className={classes.columnPinIcon} size="1rem" />
					)}
				</Stack>
				<Stack>
					<IconGripVertical className={classes.columnDragIcon} size="1rem" />
				</Stack>
				<Checkbox value={props.column} checked={props.visible} readOnly onChange={onToggle} />
			</Stack>
			<Stack>
				<Tooltip label={props.column}>
					<Text className={classes.fieldNameText} style={{ whiteSpace: 'normal' }} lineClamp={1}>
						{props.column}
					</Text>
				</Tooltip>
			</Stack>
		</Stack>
	);
};

const LoadingView = () => {
	return (
		<Stack style={{ padding: '0.5rem 0.7rem' }}>
			<Skeleton height="2.2rem" />
			<Skeleton height="2.2rem" />
			<Skeleton height="2.2rem" />
			<Skeleton height="2.2rem" />
			<Skeleton height="2.2rem" />
			<Skeleton height="2.2rem" />
		</Stack>
	);
};

const ColumnsList = (props: { isLoading: boolean }) => {
	const [tableOpts, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const [searchValue, setSearchValue] = useState<string>('');
	const { headers, disabledColumns, orderedHeaders, pinnedColumns } = tableOpts;
	const columnsToShowRef = useRef(orderedHeaders);

	useEffect(() => {
		columnsToShowRef.current = orderedHeaders;
	}, [orderedHeaders]);

	const onSearchHandler = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (_.isEmpty(e.target.value)) {
				columnsToShowRef.current = orderedHeaders;
			} else {
				const regex = new RegExp(e.target.value, 'i');
				const filteredHeaders = _.filter(orderedHeaders, (str) => regex.test(str));
				columnsToShowRef.current = filteredHeaders;
			}
			setSearchValue(e.target.value);
		},
		[orderedHeaders],
	);

	const onToggleColumn = useCallback((column: string) => {
		setLogsStore((store) => toggleDisabledColumns(store, column));
	}, []);

	const onPinColumn = useCallback((column: string) => {
		setLogsStore((store) => togglePinnedColumns(store, column));
	}, []);

	const onDropEnd = (result: DropResult) => {
		const { destination, source } = result;

		if (!destination || destination.index === source.index) {
			return;
		}

		const reorderedColumns = Array.from(columnsToShowRef.current);
		const [removed] = reorderedColumns.splice(source.index, 1);
		reorderedColumns.splice(destination.index, 0, removed);

		columnsToShowRef.current = reorderedColumns;
		setLogsStore((store) => setOrderedHeaders(store, reorderedColumns));
	};

	if (props.isLoading) return <LoadingView />;

	return (
		<>
			<SearchBar
				placeholder="Search Columns"
				value={searchValue}
				onChangeHandler={onSearchHandler}
				disabled={_.isEmpty(headers)}
			/>
			<ScrollArea scrollbars="y">
				<DragDropContext onDragEnd={onDropEnd}>
					<Droppable droppableId="columns">
						{(provided) => (
							<div {...provided.droppableProps} ref={provided.innerRef}>
								{_.map(columnsToShowRef.current, (column, index) => (
									<Draggable key={column} draggableId={column} index={index}>
										{(provided) => (
											<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
												<ColumnItem
													onToggleColumn={onToggleColumn}
													column={column}
													visible={!_.includes(disabledColumns, column)}
													pinned={_.includes(pinnedColumns, column)}
													onPinColumn={onPinColumn}
												/>
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</ScrollArea>
		</>
	);
};

const LogsViewConfig = (props: { schemaLoading: boolean; logsLoading: boolean }) => {
	const [configViewType] = useLogsStore((store) => store.tableOpts.configViewType);
	return (
		<Stack style={{ width: LOGS_CONFIG_SIDEBAR_WIDTH }} className={classes.container}>
			<Header />
			{configViewType === 'schema' ? (
				<SchemaList isLoading={props.schemaLoading} />
			) : (
				<ColumnsList isLoading={props.logsLoading} />
			)}
		</Stack>
	);
};

export default LogsViewConfig;
