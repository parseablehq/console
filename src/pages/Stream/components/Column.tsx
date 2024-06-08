import { Log } from '@/@types/parseable/api/query';
import { Box, Checkbox, Popover, ScrollArea, Stack, TextInput, Tooltip, UnstyledButton, px, rem } from '@mantine/core';
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
	closePopover: () => void;
};

const { setAndSortData, getUniqueValues, setAndFilterData } = logsStoreReducers;

/**
 * Component that allows selecting sorting by a given field
 */
const SortWidget: FC<SortWidgetProps> = (props) => {
	const { columnName, closePopover } = props;
	const [, setLogsStore] = useLogsStore((_store) => null);
	const toggleSort = useCallback((order: 'asc' | 'desc') => {
		setLogsStore((store) => setAndSortData(store, columnName, order));
		closePopover();
	}, []);

	const classes = columnStyles;
	const { sortBtn, sortBtnActive } = classes;
	const [sortKey] = useLogsStore((store) => store.tableOpts.sortKey);
	const [sortOrder] = useLogsStore((store) => store.tableOpts.sortOrder);
	const isSortActive = sortKey === columnName;
	return (
		<Stack gap={8}>
			<Button
				className={isSortActive && sortOrder === 'asc' ? sortBtnActive : sortBtn}
				onClick={() => toggleSort('asc')}
				leftSection={<IconSortAscending stroke={1} />}>
				Sort by ascending order
			</Button>
			<Button
				className={isSortActive && sortOrder === 'desc' ? sortBtnActive : sortBtn}
				onClick={() => toggleSort('desc')}
				leftSection={<IconSortDescending stroke={1} />}>
				Sort by descending order
			</Button>
		</Stack>
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
	const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

	useEffect(() => {
		const uniqueValues = getUniqueValues(rawData, columnName);
		setUniqueValues(uniqueValues);
	}, [rawData]);

	const closePopover = useCallback(() => {
		setPopoverOpen(false);
	}, []);

	const openPopover = useCallback(() => {
		setPopoverOpen(true)
	}, [])

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
		closePopover();
		setLogsStore((store) => setAndFilterData(store, columnName, selectedValues));
	};
	const classes = columnStyles;
	const { labelBtn, applyBtn, labelIcon, searchInputStyle } = classes;

	const checkboxList =
		filteredValues.length === 0 ? (inputValueRef.current.length === 0 ? uniqueValues : []) : filteredValues;
	return (
		<th
			style={{
				padding: 0,
				textAlign: 'left',
			}}>
			<Popover
				position="bottom"
				opened={popoverOpen}
				onClose={closePopover}
				onOpen={openPopover}
				withArrow
				withinPortal
				shadow="md"
				zIndex={2}>
				<Popover.Target>
					<UnstyledButton className={labelBtn} onClick={openPopover}>
						<span>{columnName}</span>
						<IconDotsVertical size={px('0.75rem')} className={[labelIcon].filter(Boolean).join(' ')} />
					</UnstyledButton>
				</Popover.Target>
				<Popover.Dropdown>
					<Box style={{ width: rem(400) }}>
						<SortWidget columnName={columnName} closePopover={closePopover}/>
						<Stack gap={8} mt={16} style={{ flexDirection: 'row' }}>
							<IconFilter stroke={1} size="1rem" />
							<Text>Filter by values:</Text>
						</Stack>
						<TextInput
							className={searchInputStyle}
							placeholder="Search"
							leftSection={<IconSearch size={px('1rem')} />}
							onChange={onSearch}
							mt={8}
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
										classNames={{ label: classes.checkBoxLabel }}
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
