import { Log } from '@/@types/parseable/api/query';
import { Box, Checkbox, Menu, ScrollArea, Stack, TextInput, Tooltip, px } from '@mantine/core';
import { type ChangeEvent, type FC, Fragment, useRef, useCallback, useState, useEffect } from 'react';
import { IconFilter, IconSearch } from '@tabler/icons-react';
import EmptyBox from '@/components/Empty';
import { Button } from '@mantine/core';
import columnStyles from '../styles/Column.module.css';
import { Text } from '@mantine/core';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';
import _ from 'lodash';

const { getUniqueValues, setAndFilterData } = logsStoreReducers;

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
	const { applyBtn, searchInputStyle } = classes;

	const checkboxList =
		filteredValues.length === 0 ? (inputValueRef.current.length === 0 ? uniqueValues : []) : filteredValues;
	return (
		<div>
			<Box style={{ width: '20rem', padding: '0.25rem 0.5rem 0.25rem 0.5rem' }}>
				<Stack gap={8} my={16} style={{ flexDirection: 'row' }}>
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
						<Menu.Item>
							<Button className={applyBtn} onClick={onApply} disabled={selectedValues.length === 0}>
								Apply
							</Button>
						</Menu.Item>
					</Fragment>
				) : (
					<EmptyBox mb="lg" />
				)}
			</Box>
		</div>
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
