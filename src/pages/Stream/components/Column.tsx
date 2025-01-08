import { Log } from '@/@types/parseable/api/query';
import { Checkbox, Menu, ScrollArea, Stack, Switch, TextInput, Tooltip, px } from '@mantine/core';
import { type ChangeEvent, type FC, Fragment, useRef, useCallback, useState, useEffect } from 'react';
import { IconFilter, IconSearch } from '@tabler/icons-react';
import EmptyBox from '@/components/Empty';
import { Button } from '@mantine/core';
import columnStyles from '../styles/Column.module.css';
import { Text } from '@mantine/core';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';
import _ from 'lodash';

const { getUniqueValues, setAndFilterData, toggleWrapDisabledColumns } = logsStoreReducers;

type Column = {
	columnName: string;
};

const Column: FC<Column> = (props) => {
	const { columnName } = props;
	const [uniqueValues, setUniqueValues] = useState<string[]>([]);
	const [filteredValues, setFilteredValues] = useState<string[]>([]);
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [{ rawData, filteredData }, setLogsStore] = useLogsStore((store) => store.data);
	const [wrapDisabledColumns] = useLogsStore((store) => store.tableOpts.wrapDisabledColumns);
	const inputValueRef = useRef('');

	useEffect(() => {
		const uniqueValues = getUniqueValues(filteredData || rawData, columnName);
		setUniqueValues(uniqueValues);
	}, [rawData, filteredData]);

	const onSearch = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const searchStr = e.target.value.trim();
			inputValueRef.current = searchStr;
			const matches = _.chain(uniqueValues)
				.filter((uniqueValue) => uniqueValue.toLowerCase().includes(searchStr.toLowerCase()))
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

	const onToggleWrap = () => {
		setLogsStore((store) => toggleWrapDisabledColumns(store, columnName));
	};
	const wordWrapEnabled = _.includes(wrapDisabledColumns, columnName);
	return (
		<div>
			<Stack style={{ width: '20rem', padding: '0.8rem 1rem' }} gap={16}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<Text style={{ fontSize: '0.7rem', fontWeight: 600 }}>Word Wrap</Text>
					<Switch
						styles={{ label: { fontSize: '0.7rem' } }}
						labelPosition="left"
						label={wordWrapEnabled ? 'Enabled' : 'Disabled'}
						checked={wordWrapEnabled}
						onChange={onToggleWrap}
					/>
				</Stack>
				<Stack gap={4}>
					<Stack gap={4} style={{ flexDirection: 'row', alignItems: 'center' }}>
						<IconFilter stroke={1.4} size="0.8rem" />
						<Text style={{ fontSize: '0.7rem', fontWeight: 600 }}>Filter by values:</Text>
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
				</Stack>
			</Stack>
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
