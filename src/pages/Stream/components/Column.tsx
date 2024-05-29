import { Log } from '@/@types/parseable/api/query';
import { Box, Checkbox, Popover, ScrollArea, Stack, TextInput, Tooltip, UnstyledButton, px } from '@mantine/core';
import { type ChangeEvent, type FC, Fragment, useRef, useCallback, useState, useEffect } from 'react';
import { IconDotsVertical, IconFilter, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import EmptyBox from '@/components/Empty';
import { Button } from '@mantine/core';
import columnStyles from '../styles/Column.module.css';
import { Text } from '@mantine/core';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';
import _ from 'lodash';

type SortWidgetProps = {
	columnName: string;
};

const { setAndSortData, getUniqueValues, setAndFilterData } = logsStoreReducers;

/**
 * Component that allows selecting sorting by a given field
 */
const SortWidget: FC<SortWidgetProps> = (props) => {
	const { columnName } = props;
	const [, setLogsStore] = useLogsStore((_store) => null);
	const toggleSort = useCallback((order: 'asc' | 'desc') => {
		setLogsStore((store) => setAndSortData(store, columnName, order));
	}, []);

	const classes = columnStyles;
	const { sortBtn, sortBtnActive } = classes;
	const [sortKey] = useLogsStore((store) => store.tableOpts.sortKey);
	const [sortOrder] = useLogsStore((store) => store.tableOpts.sortOrder);
	const isSortActive = sortKey === columnName;
	return (
		<Box>
			<Button
				className={isSortActive && sortOrder === 'asc' ? sortBtnActive : sortBtn}
				onClick={() => toggleSort('asc')}
				leftSection={<IconSortAscending stroke={1} />}>
				Sort by Ascending order
			</Button>
			<Button
				className={isSortActive && sortOrder === 'desc' ? sortBtnActive : sortBtn}
				onClick={() => toggleSort('desc')}
				leftSection={<IconSortDescending stroke={1} />}>
				Sort by Descending order
			</Button>
		</Box>
	);
};

type Column = {
	columnName: string;
};

const Column: FC<Column> = (props) => {
	const { columnName } = props;
	const [uniqueValues, setUniqueValues] = useState<string[]>([]);
	const [filteredValues, setFilteredValues] = useState<string[]>([]);
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [rawData, setLogsStore] = useLogsStore((store) => store.data.rawData);
	const inputValueRef = useRef('');

	useEffect(() => {
		const uniqueValues = getUniqueValues(rawData, columnName);
		setUniqueValues(uniqueValues);
	}, [rawData]);

	const onSearch = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const searchStr = e.target.value.trim();
			inputValueRef.current = searchStr;
			const regexPattern = new RegExp(searchStr, 'i');
			const matches = _.chain(uniqueValues)
				.filter((uniqueValue) => regexPattern.test(uniqueValue))
				.value();
			setFilteredValues(matches);
		},
		[uniqueValues],
	);

	const onSelect = useCallback((values: string[]) => {
		setSelectedValues(values);
	}, []);

	const onApply = () => {
		setLogsStore((store) => setAndFilterData(store, columnName, selectedValues));
	};
	const classes = columnStyles;
	const { labelBtn, applyBtn, labelIcon, searchInputStyle, filterText } = classes;

	const checkboxList =
		filteredValues.length === 0 ? (inputValueRef.current.length === 0 ? uniqueValues : []) : filteredValues;
	return (
		<th
			style={{
				height: '42px',
				padding: 0,
				textAlign: 'left',
			}}>
			<Popover position="bottom" withArrow withinPortal shadow="md" zIndex={2}>
				<Popover.Target>
					<UnstyledButton className={labelBtn}>
						<span>{columnName}</span>
						<IconDotsVertical size={px('1rem')} className={[labelIcon].filter(Boolean).join(' ')} />
					</UnstyledButton>
				</Popover.Target>
				<Popover.Dropdown>
					<Box>
						<SortWidget columnName={columnName} />
						<Button className={filterText} leftSection={<IconFilter stroke={1} />}>
							Filter by values:
						</Button>

						<TextInput
							className={searchInputStyle}
							placeholder="Search"
							leftSection={<IconSearch size={px('0.8rem')} />}
							onChange={onSearch}
						/>
						{checkboxList.length ? (
							<Fragment>
								<CheckboxVirtualList
									columnName={columnName}
									list={checkboxList}
									selectedFilters={selectedValues}
									onSelect={onSelect}
								/>
								<Button className={applyBtn} onClick={onApply} disabled={selectedValues.length === 0}>
									Apply
								</Button>
							</Fragment>
						) : (
							<EmptyBox mb="lg" />
						)}
					</Box>
				</Popover.Dropdown>
			</Popover>
		</th>
	);
};

type CheckboxVirtualListProps = {
	columnName: string;
	list: Log[number][];
	selectedFilters: string[];
	onSelect: (value: string[]) => void;
};

const SLICE_OFFSET = 50;

const CheckboxVirtualList: FC<CheckboxVirtualListProps> = (props) => {
	const { list, selectedFilters, onSelect } = props;
	const classes = columnStyles;
	const totalValues = list.length;
	const shortList = list.slice(0, SLICE_OFFSET);
	const { checkBoxStyle } = classes;

	const remainingLength = totalValues > SLICE_OFFSET ? totalValues - SLICE_OFFSET : 0;

	return (
		<Checkbox.Group value={selectedFilters} onChange={onSelect}>
			<ScrollArea style={{ height: 250 }}>
				{shortList.map((item, index) => {
					const label = item?.toString() || '';
					return (
						<div key={`${label}${index}`}>
							<Tooltip label={label} key={index} openDelay={500} maw={300} multiline>
								<Stack style={{ width: '100%', justifyContent: 'center' }}>
									<Checkbox
										value={label}
										label={label}
										className={checkBoxStyle}
										styles={{
											label: { textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap', overflow: 'hidden' },
											body: {
												textOverflow: 'ellipsis',
											},
										}}
									/>
								</Stack>
							</Tooltip>
							{index + 1 === shortList.length && remainingLength > 0 && (
								<Text ta="center" c="gray.5" style={{ margin: '8px 0' }}>{`+${remainingLength} more`}</Text>
							)}
						</div>
					);
				})}
			</ScrollArea>
		</Checkbox.Group>
	);
};

export default Column;
