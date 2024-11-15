import { LOGS_CONFIG_SIDEBAR_WIDTH } from '@/constants/theme';
import { Checkbox, Divider, Group, ScrollArea, Select, Skeleton, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import classes from '../../styles/LogsViewConfig.module.css';
import { streamStoreReducers, useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { Field } from '@/@types/parseable/dataType';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { IconChevronsLeft, IconGripVertical, IconPin, IconPinFilled } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const { toggleConfigViewType, toggleDisabledColumns, setOrderedHeaders, togglePinnedColumns, setDisabledColumns } =
	logsStoreReducers;

const { toggleSideBar } = streamStoreReducers;

const Header = () => {
	const [configViewType, setLogsStore] = useLogsStore((store) => store.tableOpts.configViewType);

	const onChange = useCallback(
		(value: string | null) => {
			if (!value || value === configViewType) return;

			setLogsStore(toggleConfigViewType);
		},
		[configViewType],
	);

	return (
		<Stack className={classes.headerContainer} gap={0}>
			<Select
				data={[
					{ label: 'Table Headers', value: 'columns' },
					{ label: 'Schema Fields', value: 'schema' },
				]}
				value={configViewType}
				allowDeselect={false}
				onChange={(value) => onChange(value)}
				style={{ width: '100%', height: '100%' }}
			/>
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
			<Stack style={{ width: '100%', position: 'relative' }}>
				<Tooltip label={name}>
					<Text className={classes.fieldNameText} style={{ position: 'absolute' }}>
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
				placeholder="Search Fields"
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
	onOnlyClick: (column: string) => void;
}) => {
	const onToggle = useCallback(() => {
		props.onToggleColumn(props.column);
	}, []);

	const onPin = useCallback(() => {
		props.onPinColumn(props.column);
	}, []);

	const handleOnlyClick = useCallback(() => {
		props.onOnlyClick(props.column);
	}, []);

	return (
		<Stack className={classes.columnItemContainer} gap={8} style={{ cursor: 'default', alignItems: 'center' }}>
			<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
				<Stack style={{ cursor: 'pointer' }} onClick={onPin}>
					{props.pinned ? (
						<IconPinFilled className={classes.columnPinIcon} size="1rem" stroke={1.8} />
					) : (
						<IconPin className={classes.columnPinIcon} size="1rem" stroke={1.8} />
					)}
				</Stack>
				<Stack>
					<IconGripVertical className={classes.columnDragIcon} size="1rem" stroke={1.2} />
				</Stack>
				<Checkbox value={props.column} checked={props.visible} readOnly onChange={onToggle} />
			</Stack>
			<Stack style={{ width: '100%', position: 'relative', height: '1rem' }}>
				<Tooltip label={props.column}>
					<Text className={classes.fieldNameText} style={{ whiteSpace: 'normal', position: 'absolute' }} lineClamp={1}>
						{props.column}
					</Text>
				</Tooltip>
			</Stack>
			<Text className={classes.onlyBtn} onClick={handleOnlyClick}>
				only
			</Text>
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

	const handleClearAllClick = useCallback(() => {
		setLogsStore((store) => setDisabledColumns(store, orderedHeaders));
	}, [orderedHeaders]);

	const handleSelectAllClick = useCallback(() => {
		setLogsStore((store) => setDisabledColumns(store, []));
	}, [orderedHeaders]);

	const handleOnlyClick = useCallback(
		(column: string) => {
			const filteredHeaders = orderedHeaders.filter((el) => el !== column);
			setLogsStore((store) => setDisabledColumns(store, filteredHeaders));
		},
		[orderedHeaders],
	);

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
				placeholder="Search Headers"
				value={searchValue}
				onChangeHandler={onSearchHandler}
				disabled={_.isEmpty(headers)}
			/>
			<Stack style={{ height: '100%' }} gap={0}>
				<Group
					gap={8}
					style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 1rem', marginBottom: '0.3rem' }}>
					<Text
						className={classes.fieldActionBtn}
						onClick={handleSelectAllClick}
						style={!_.isEmpty(disabledColumns) ? {} : { color: 'gray', cursor: 'default' }}>
						Select All
					</Text>
					<Divider orientation="vertical" style={{ borderWidth: '0.1rem' }} />
					<Text
						className={classes.fieldActionBtn}
						onClick={handleClearAllClick}
						style={!(orderedHeaders.length === disabledColumns.length) ? {} : { color: 'gray', cursor: 'default' }}>
						Clear All
					</Text>
				</Group>
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
														onOnlyClick={handleOnlyClick}
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
			</Stack>
		</>
	);
};

const LogsViewConfig = (props: { schemaLoading: boolean; logsLoading: boolean; infoLoading: boolean }) => {
	const [configViewType] = useLogsStore((store) => store.tableOpts.configViewType);
	const [maximized] = useAppStore((store) => store.maximized);
	const [{ sideBarOpen }, setStreamStore] = useStreamStore((store) => store);

	const divRef = useRef<HTMLDivElement | null>(null);
	const [height, setHeight] = useState(0);

	useEffect(() => {
		if (divRef.current) {
			setHeight(divRef.current.offsetHeight);
		}
	}, [maximized]);

	return (
		<Stack
			ref={divRef}
			style={{
				borderRight: '1px solid var(--mantine-color-gray-2)',
				width: sideBarOpen ? 0 : LOGS_CONFIG_SIDEBAR_WIDTH,
				transition: 'width 0.5s',
			}}>
			<Stack style={{ width: LOGS_CONFIG_SIDEBAR_WIDTH, height: height - 30 }} className={classes.container}>
				<Header />
				{configViewType === 'schema' ? (
					<SchemaList isLoading={props.schemaLoading || props.infoLoading} />
				) : (
					<ColumnsList isLoading={props.logsLoading || props.infoLoading} />
				)}
			</Stack>
			<Stack className={classes.collapseBtn}>
				{!sideBarOpen && (
					<Tooltip label="Collapse" position="left">
						<IconChevronsLeft
							className={classes.collapseIcon}
							onClick={() => setStreamStore((store) => toggleSideBar(store))}
							stroke={1.2}
							size="1.2rem"
						/>
					</Tooltip>
				)}
			</Stack>
		</Stack>
	);
};

export default LogsViewConfig;
